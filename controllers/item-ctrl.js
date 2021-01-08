const Item = require('../models/item-model');

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

getItems = (req, res) => {
  Item.paginate(checkMode(req.params.mode), {
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
