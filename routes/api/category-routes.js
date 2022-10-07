const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try {
    const categoryData = await Category.findAll({
      include: [{ model: Product, as: "products" }],
      });
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try {
    const categoryData = await Category.findByPk(req.params.id, {
      include: [{ model: Product, as: "products" }],
    });
    if (!categoryData) {
      res.status(404).json({ message: "No category found with that id!"});
      return;
    }
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});


  // create a new category
  router.post('/', async (req, res) => {
    try {
      const categoryData = await Category.create(req.body);
      return res.json(categoryData);
    }
      catch (err) {
      res.status(400).json(err);
    }
  });



  // update a category by its `id` value
  router.put('/:id', async (req, res) => {
    try {
      const categoryData = await Category.update({
        category_name: req.body.category_name},
        {where: {
          id: req.params.id,
        },
     });
      if (!categoryData) {
        res.status(404).json({ message: 'No category with this id!' });
        return;
      }
      res.status(200).json(categoryData);
    } catch (err) {
      res.status(500).json(err);
    }
  });



  // delete a category by its `id` value
  router.delete('/:id', async (req, res) => {
    try {
      const categoryData = await Category.destroy({
        where: {
          id: req.params.id,
        },
      });
  
      if (!categoryData) {
        res.status(404).json({ message: 'No category card found with that id!' });
        return;
      }
  
      res.status(200).json(categoryData);
    } catch (err) {
      res.status(500).json(err);
    }
  });
  


module.exports = router;
