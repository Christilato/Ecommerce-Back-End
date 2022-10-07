const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
// find all products
  // be sure to include its associated Category and Tag data
router.get('/', async (req, res) => {
  try {
    const productData = await Product.findAll({
      include: [{ model: Category, as: "category" }, { model: Tag, as: "tags" }],
    });
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get one product
 // find a single product by its `id`
  // be sure to include its associated Category and Tag data
router.get('/:id', async (req, res) => {
  try {
    const productData = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: "category" }, { model: Tag }]
    })
    if (!productData) {
      res.status(404).json({ message: "No product found with that id!"});
      return;
    }
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new product
router.post('/', async (req, res) => {
   /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
 // first we take the form and directly try to make a new product
  Product.create(req.body)
    .then(async (product) => {
      //after successfullly adding a product we now have a product id
      //then we check to see if the req.body had tag ids that we want to associate with this product id/
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        // after finding tag ids we make a new array => [{product_id:2, tag_id: 1},{product_id:2, tag_id: 3}, {product_id:2, tag_id: 4}]
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        //then go to product tag model and bulk add the product tag array
        const ptag = await ProductTag.bulkCreate(productTagIdArr);
        res.status(200).json(ptag);
        return;
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then(async (product) => {
// check to see if tag ids were apart of the req and if so we need to update them as well
      if (req.body.tagIds.length) {
        // after finding tag ids we make a new array => [{product_id:2, tag_id: 1},{product_id:2, tag_id: 3}, {product_id:2, tag_id: 4}]
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        // we know all the product ids and tag ids for ptag that need update.
        for( const ptag of productTagIdArr) {
          ProductTag.destroy({where: {
            tag_id: ptag.tag_id
          }})
        };
        // since there is no bulk update (i think) then we need to remove all the ptags and then bulk add them
        const updatedTags = await ProductTag.bulkCreate(productTagIdArr);
        res.json("success");
        return;
      }


      res.json(product);
    //   // find all associated tags from ProductTag
    //   return ProductTag.findAll({ where: { product_id: req.params.id } });
    // })
    // .then((productTags) => {
    //   // get list of current tag_ids
    //   const productTagIds = productTags.map(({ tag_id }) => tag_id);
    //   // create filtered list of new tag_ids
    //   const newProductTags = req.body.tag_id
    //     .filter((tag_id) => !productTagIds.includes(tag_id))
    //     .map((tag_id) => {
    //       return {
    //         product_id: req.params.id,
    //         tag_id,
    //       };
    //     });
    //   // figure out which ones to remove
    //   const productTagsToRemove = productTags
    //     .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
    //     .map(({ id }) => id);

    //   // run both actions
    //   return Promise.all([
    //     ProductTag.destroy({ where: { id: productTagsToRemove } }),
    //     ProductTag.bulkCreate(newProductTags),
    //   ]);
    // })
    // .then((updatedProductTags) => res.json(updatedProductTags))
    // .catch((err) => {
    //   // console.log(err);
    //   res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const productData = await Product.destroy({
      where: { id: req.params.id }
    });
    if (!productData) {
      res.status(404).json({ message: 'No product with this id!' });
      return;
    }
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;

