const Item = require('../models/item-model');
const ItemVotes = require('../models/itemVotes-model');
const User = require('../models/user-model');
const Comments = require('../models/comments-model');

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

error500Response = (error, res) => {
  return res.status(500).json({
    error: 'Wystąpił problem z połączeniem. Prosimy spróbować później.',
  });
};

createItem = (req, res) => {
  const { bodyPayload } = req.body;

  if (!req.body) {
    return res.status(400).json({
      error: 'Nie znaleziono danych do dodania.',
    });
  }

  const item = new Item(bodyPayload);

  if (!item) {
    return res.status(400).json({ error: 'Bład podczas walidacji danych.' });
  }

  item
    .save()
    .then(() => {
      return res.status(201).json({
        message: 'Twój Motywator został dodany pomyślnie.',
      });
    })
    .catch(() => {
      return res.status(400).json({
        error:
          'Wystąpił problem podczas dodawania treści. Prosimy spróbować później.',
      });
    });
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
        from: Comments.collection.name,
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
        from: Comments.collection.name,
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
        userName: '$userName.name',
        commentsCount: { $size: '$commentsCount' },
      },
    },
  ]);

  Item.aggregatePaginate(aggregate, {
    offset: req.params.offset,
    limit: req.params.perPage,
    sort: {
      ...(req.params.mode !== 'top' && { createdAt: 'desc' }),
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
  const ip = req.connection.remoteAddress;

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
              Item.update(
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

module.exports = {
  /*   
  deleteItem, */
  createItem,
  getItems,
  getItemById,
  itemVote,
};
