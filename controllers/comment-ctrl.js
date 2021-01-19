const Comment = require('../models/comment-model');
const CommentVotes = require('../models/comment-votes-model');
const User = require('../models/user-model');
const Item = require('../models/item-model');

createComment = (req, res) => {
  const { userId, itemId, commentBody, parentCommentId } = req.body;

  if (!req.body) {
    return res.status(400).json({
      error: 'Nie znaleziono danych do dodania.',
    });
  }

  Item.findOne({
    id: itemId,
  })
    .then((response) => {
      if (!response) {
        return res.status(404).json({
          error: 'Nie ma takiego itemu do którego chcesz dodać komentarz',
        });
      }

      Comment.findOne({
        comment_id: parentCommentId,
      })
        .then((response) => {
          if (!response && parentCommentId) {
            return res.status(404).json({
              error:
                'Nie ma takiego komentarza do którego chcesz dodać odpowiedź',
            });
          }

          const comment = new Comment({
            userId,
            itemId,
            commentBody,
            parentCommentId,
          });

          comment
            .save()
            .then((data) => {
              return res.status(201).json({
                message: 'Twój komentarz został dodany pomyślnie.',
                newCommentId: data.comment_id,
              });
            })
            .catch((error) => {
              return res.status(400).json({
                error: 'Wystąpił problem podczas dodawania komentarza.',
                err: error,
              });
            });
        })
        .catch(() => {
          return res.status(500).json({
            error: 'Wystąpił problem z połączeniem. Prosimy spróbować później.',
          });
        });
    })
    .catch(() => {
      return res.status(500).json({
        error: 'Wystąpił problem z połączeniem. Prosimy spróbować później.',
      });
    });
};

getComments = (req, res) => {
  Comment.aggregate([
    {
      $match: {
        $and: [
          {
            itemId: parseInt(req.params.itemId),
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
      $project: {
        comment_id: 1,
        userId: 1,
        itemId: 1,
        commentBody: 1,
        votes: 1,
        votesCount: 1,
        parentCommentId: 1,
        createdAt: 1,
        userName: '$userName.name',
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ])
    .then((comments) => {
      if (comments.length === 0) {
        return res.status(404).json({ error: `Comments not found` });
      }

      return res.status(200).json({ comments });
    })
    .catch(() => {
      return res.status(500).json({
        error: 'Wystąpił problem z połączeniem. Prosimy spróbować później.',
      });
    });
};

commentVote = (req, res) => {
  const { commentId, voteValue, userId } = req.body;

  let voteMode = 0;
  let votesCountMode = 1;

  if (voteValue === 'up') {
    voteMode = 1;
  } else if (voteValue === 'down') {
    voteMode = -1;
  } else {
    votesCountMode = 0;
  }

  CommentVotes.findOne({
    votedCommentId: commentId,
    userId: userId,
  })
    .then((vote) => {
      if (vote) {
        return res.status(404).json({ error: 'Juz głosowałeś' });
      }

      Comment.findOne({
        comment_id: commentId,
      })
        .then((comment) => {
          if (!comment) {
            return res.status(404).json({ error: `Comment not found` });
          }

          const commentVote = new CommentVotes({
            userId: userId,
            votedCommentId: commentId,
          });

          if (!commentVote) {
            return res.status(400).json({
              error: 'Bład podczas walidacji danych.',
            });
          }

          commentVote
            .save()
            .then(() => {
              Comment.updateOne(
                { comment_id: commentId },
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
  createComment,
  getComments,
  commentVote,
};
