const Item = require('../models/item-model');

checkMode = (mode) => {
  if (mode === 'accepted' || mode === 'pending' || mode === 'top') {
    return {
      isAccepted: mode === 'pending' ? false : true,
    };
  } else {
    return {};
  }
};

createItem = (req, res) => {
  const body = req.body;

  if (!body) {
    return res.status(400).json({
      success: false,
      error: 'You must provide a item',
    });
  }

  const item = new Item(body);

  if (!item) {
    return res.status(400).json({ success: false, error: err });
  }

  item
    .save()
    .then(() => {
      return res.status(201).json({
        success: true,
        message: 'Item created!',
      });
    })
    .catch((error) => {
      return res.status(400).json({
        error,
        message: 'Item not created!',
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

getItemById = async (req, res) => {
  await Item.findOne({ id: req.params.id }, (err, item) => {
    if (err) {
      return res.status(400).json({ success: false, error: err });
    }

    if (!item) {
      return res.status(404).json({ success: false, error: `Item not found` });
    }
    return res.status(200).json({ success: true, data: item });
  }).catch((err) => console.log(err));
};

getItems = async (req, res) => {
  await Item.paginate(checkMode(req.params.mode), {
    offset: req.params.offset,
    limit: req.params.perPage,
    sort: { createdAt: 'desc' },
  })
    .then((items) => {
      if (!items.docs.length) {
        return res
          .status(404)
          .json({ success: false, error: `Items not found` });
      }

      return res.status(200).json({ success: true, items });
    })
    .catch((err) => console.log(err));
};

getItemsCount = async (req, res) => {
  await Item.countDocuments(checkMode(req.params.mode), (err, count) => {
    if (err) {
      return res.status(400).json({ success: false, error: err });
    }

    return res.status(200).json({ success: true, itemsCount: count });
  }).catch((err) => console.log(err));
};

module.exports = {
  /*   
  deleteItem, */
  createItem,
  getItems,
  getItemsCount,
  getItemById,
};
