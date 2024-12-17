import express from "express";
import { serversideIssue } from "../server.js";
import { queryDatabase } from "../serverside utils/database.js";

var searchRouter = express.Router();
const productsPerPage = 30;

searchRouter.get("/", (req, res) => {
   //change page search bar and load page
   res.render("pages/index.ejs", { searchBarValue: req.query.s, pageNumber:req.query.page  }); //renders new page with the search bar value set to something new, and gives gives back search data
});

searchRouter.get("/getSearchData", (req, res) => {

    const search = req.query.s.toLowerCase();

    /*finds product that:
    - matches product name
    - search includes keyword
    - product name includes search
    - then (if not found 12):
    - order by levenshtein distance between search and product keyword*/

    const findProductsQuery = 
   `(
        SELECT *
        FROM products
        WHERE accepted = 0
        AND (
            LOWER(productName) LIKE CONCAT('%', ?, '%') 
            OR ? LIKE CONCAT('%', LOWER(productName), '%')
            OR LOWER(productKeyWord) LIKE CONCAT('%', ?, '%') 
            OR ? LIKE CONCAT('%', LOWER(productKeyWord), '%')
        )
        ORDER BY LOWER(productName) = ? DESC
    )
    UNION 
    (
        SELECT *
        FROM products
        WHERE accepted = 0
        ORDER BY levenshtein_distance(LOWER(productKeyWord), ?) ASC
    )
    LIMIT ?
    OFFSET ?;`

    
    //gets products where search is including in the product name, prioritizing a search where search = product name
    queryDatabase(findProductsQuery, [search, search, search, search, search, search, productsPerPage, ((req.query.page - 1) * productsPerPage)])
    .then(results => {
        res.json(results);
    })
});

searchRouter.get("/getRandomProductFeed", (req, res) => {
    const findProductsQuery = 
   `SELECT *
    FROM products
    WHERE accepted = 0
    ORDER BY RAND()
    LIMIT ? 
    OFFSET ?;`
    
    //gets products where search is including in the product name, prioritizing a search where search = product name
    queryDatabase(findProductsQuery, [productsPerPage, ((req.query.page - 1) * productsPerPage)]).then(results => {
        res.json(results);
    })

});

export default searchRouter;


