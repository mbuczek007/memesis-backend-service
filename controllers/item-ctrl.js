const Item = require('../models/item-model');
const ItemVotes = require('../models/item-votes-model');
const User = require('../models/user-model');
const Comment = require('../models/comment-model');
const getVideoId = require('get-video-id');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

checkMode = (mode) => {
  if (mode === 'accepted' || mode === 'top') {
    return {
      isAccepted: true,
    };
  } else if (mode === 'pending') {
    return {
      isAccepted: false,
    };
  } else {
    return {};
  }
};

generateFileName = (fileName) => {
  return uuidv4() + '-' + Date.now() + path.extname(fileName);
};

saveItemMethod = (item, res) => {
  item
    .save()
    .then(() => {
      return res.status(201).json({
        message: 'Twój Motywator został dodany pomyślnie.',
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({
        error:
          'Wystąpił problem podczas dodawania treści. Prosimy spróbować później.',
      });
    });
};

error500Response = (error, res) => {
  return res.status(500).json({
    error: 'Wystąpił problem z połączeniem. Prosimy spróbować później.',
  });
};

createItem = (req, res) => {
  const {
    title,
    subtitle,
    source,
    mediaUrl,
    mediaType,
    disableComments,
    userId,
  } = req.body;

  let mediaItem = mediaUrl;

  if (!req.body) {
    return res.status(400).json({
      error: 'Nie znaleziono danych do dodania.',
    });
  }

  if (
    mediaType === 'file' &&
    (!req.files || Object.keys(req.files).length === 0)
  ) {
    return res
      .status(400)
      .json({ error: 'Nie znaleziono zdjęcia do przesłania.' });
  }

  if (mediaType === 'yt-video') {
    const { id } = getVideoId(mediaUrl);
    mediaItem = id;
  } else if (mediaType === 'file') {
    mediaItem = generateFileName(req.files.mediaUrl.name);
  }

  const item = new Item({
    title,
    subtitle,
    source,
    mediaUrl: mediaItem,
    mediaType,
    disableComments,
    userId,
  });

  if (!item) {
    return res.status(400).json({ error: 'Bład podczas walidacji danych.' });
  }

  if (mediaType === 'file') {
    const fileType = req.files.mediaUrl.mimetype;

    if (
      fileType !== 'image/png' &&
      fileType !== 'image/jpg' &&
      fileType !== 'image/jpeg'
    ) {
      return res.status(400).json({ error: 'Nieprawidłowy format pliku.' });
    }

    req.files.mediaUrl.mv('./uploads/items/' + mediaItem, (err) => {
      if (err) {
        return res.status(500).json({
          error: 'Wystąpił problem z zapisem zdjęcia.',
        });
      }

      saveItemMethod(item, res);
    });
  } else {
    saveItemMethod(item, res);
  }
};

/* deleteItem = async (req, res) => {
  await Item.findOneAndDelete({ _id: req.params.id }, (err, item) => {
    if (err) {
      return res.status(400).json({ success: false, error: err });
    }

    if (!item) {
      return res.status(404).json({ success: false, error: `Item not found` });
    }

    return res.status(200).json({ success: true, data: item });
  }).catch((err) => console.log(err));
};

 */

getItemById = (req, res) => {
  Item.aggregate([
    {
      $match: {
        $and: [
          {
            id: parseInt(req.params.id),
          },
        ],
      },
    },
    {
      $lookup: {
        from: User.collection.name,
        localField: 'userId',
        foreignField: 'user_id',
        as: 'userName',
      },
    },
    { $unwind: '$userName' },
    {
      $lookup: {
        from: Comment.collection.name,
        localField: 'id',
        foreignField: 'itemId',
        as: 'commentsCount',
      },
    },
    {
      $project: {
        id: 1,
        title: 1,
        subtitle: 1,
        source: 1,
        mediaUrl: 1,
        mediaType: 1,
        isAccepted: 1,
        acceptedDate: 1,
        disableComments: 1,
        votes: 1,
        votesCount: 1,
        createdAt: 1,
        updatedAt: 1,
        firstAcceptedDate: 1,
        userName: '$userName.name',
        commentsCount: { $size: '$commentsCount' },
      },
    },
  ])
    .then((item) => {
      if (item.length === 0) {
        return res.status(404).json({ error: `Item not found` });
      }

      return res.status(200).json({ item: item[0] });
    })
    .catch((error) => {
      error500Response(error, res);
    });
};

getItems = (req, res) => {
  const aggregate = Item.aggregate([
    {
      $match: {
        $and: [checkMode(req.params.mode)],
      },
    },
    {
      $lookup: {
        from: User.collection.name,
        localField: 'userId',
        foreignField: 'user_id',
        as: 'userName',
      },
    },
    { $unwind: '$userName' },
    {
      $lookup: {
        from: Comment.collection.name,
        localField: 'id',
        foreignField: 'itemId',
        as: 'commentsCount',
      },
    },
    {
      $project: {
        id: 1,
        title: 1,
        subtitle: 1,
        source: 1,
        mediaUrl: 1,
        mediaType: 1,
        isAccepted: 1,
        acceptedDate: 1,
        disableComments: 1,
        votes: 1,
        votesCount: 1,
        createdAt: 1,
        updatedAt: 1,
        firstAcceptedDate: 1,
        userName: '$userName.name',
        commentsCount: { $size: '$commentsCount' },
      },
    },
  ]);

  Item.aggregatePaginate(aggregate, {
    offset: req.params.offset,
    limit: req.params.perPage,
    sort: {
      ...(req.params.mode === 'accepted' && { firstAcceptedDate: 'desc' }),
      ...(req.params.mode === 'pending' && { createdAt: 'desc' }),
      ...(req.params.mode === 'top' && { votes: 'desc' }),
    },
  })
    .then((items) => {
      if (items.totalDocs === 0) {
        return res.status(404).json({ error: `Items not found` });
      }

      return res.status(200).json({ items });
    })
    .catch((error) => {
      error500Response(error, res);
    });
};

itemVote = (req, res) => {
  const { itemId, voteValue } = req.body;
  const ip = req.clientIp;

  let voteMode = 0;
  let votesCountMode = 1;

  if (voteValue === 'up') {
    voteMode = 1;
  } else if (voteValue === 'down') {
    voteMode = -1;
  } else {
    votesCountMode = 0;
  }

  ItemVotes.findOne({
    votedItemId: itemId,
    ipAddress: ip,
  })
    .then((item) => {
      if (item) {
        return res.status(404).json({ error: 'Juz głosowałeś' });
      }

      Item.findOne({
        id: itemId,
      })
        .then((item) => {
          if (!item) {
            return res.status(404).json({ error: `Item not found` });
          }

          const itemVote = new ItemVotes({
            votedItemId: itemId,
            ipAddress: ip,
          });

          if (!itemVote) {
            return res.status(400).json({
              error: 'Bład podczas walidacji danych.',
            });
          }

          itemVote
            .save()
            .then(() => {
              Item.updateOne(
                { id: itemId },
                { $inc: { votes: voteMode, votesCount: votesCountMode } },
                (err, result) => {
                  if (err) {
                    return res.status(400).json({ error: err });
                  } else {
                    return res.status(200).json({
                      data: result,
                      message: 'Głos oddany',
                    });
                  }
                }
              );
            })
            .catch(() => {
              return res.status(400).json({
                error: 'Błąd podczas oddania głosu.',
              });
            });
        })
        .catch((error) => {
          error500Response(error, res);
        });
    })
    .catch((error) => {
      error500Response(error, res);
    });
};

itemStatusChange = (req, res) => {
  const { itemId, status, itemFirstAcceptedDate, userId } = req.body;

  let updatedData = {};

  if (!itemFirstAcceptedDate) {
    updatedData = {
      isAccepted: status,
      firstAcceptedDate: new Date(),
      statusChangerUserId: userId,
    };
  } else {
    updatedData = { isAccepted: status, statusChangerUserId: userId };
  }

  Item.findOneAndUpdate(
    { id: itemId },
    { $set: updatedData },
    { new: true },
    (err, doc) => {
      if (err) {
        return res.status(400).json({
          error: 'Błąd podczas zmiany statusu.',
        });
      }

      return res.status(200).json({
        data: doc,
      });
    }
  );
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  itemVote,
  itemStatusChange,
};
