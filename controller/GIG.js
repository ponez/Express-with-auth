const GIG = require("../model/gigs");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

let items = 2;
function getNewParamsParameter(queryObj, key, value) {
  let newQuery = JSON.parse(JSON.stringify(queryObj)); // Clone current request query
  newQuery[key] = value; // Set page of the query
  let newURL = Object.keys(newQuery)
    .map((key) => {
      return `${key}=${newQuery[key]}`;
    })
    .join("&"); // Get url with that page from query object
  return newURL;
}

exports.getList = (req, res) => {
  console.log("here");
  let page = +req.query.page || 1;
  let totalItems;
  let { term } = req.query;

  if (term !== undefined || term != null) {
    term.toLowerCase();
  }
  function getURLByPage(page) {
    return getNewParamsParameter(req.query, "page", page);
  }
  function getNewURLBySort(sort) {
    return getNewParamsParameter(req.query, "sort", sort);
  }
  let findProps = {
    limit: items,
    offset: (page - 1) * items,
  };
  if (req.query.search)
    findProps.where = {
      technologies: {
        [Op.like]: "%" + term + "%",
      },
    };
  if (req.query.sort) findProps.order = [[req.query.sort, "ASC"]];

  GIG.count()
    .then((data) => {
      totalItems = data;
    })
    .catch((err) => console.log(err));
  GIG.findAll(findProps).then((gigs) => {
    if (!gigs || gigs === [] || gigs === "") {
      res.render("gigs/gigs.ejs", {
        error: "no job is avaliable right now ! sorry",
      });
      console.log("no job");
    } else {
      //   console.log(gigs);
      res.render("gigs/gigs.ejs", {
        gigs,
        currentPage: page,
        totalJobs: items,
        hasNextPage: items * page < totalItems,
        hasPrevPage: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        lastPage: Math.ceil(totalItems / items),
        nextPageURL: getURLByPage(page + 1),
        prevPageURL: getURLByPage(page - 1),
        gigID: gigs.id,
        sortByBudgetURL: getNewURLBySort("budget"),
      });
    }
  });
};
exports.getAddList = (req, res) => {
  res.render("gigs/add.ejs");
};
exports.postAddList = (req, res) => {
  let { title, technologies, budget, description, contact_email } = req.body;
  let errors = [];

  if (!title) errors.push("Please add title");
  if (!technologies) errors.push("Please add Technologies");
  if (!description) errors.push("Please add description");
  if (!contact_email) errors.push("Please add email");
  if (errors.length > 0) {
    res.render(
      "gigs/add.ejs",
      title,
      technologies,
      budget,
      description,
      contact_email
    );
  } else {
    if (!budget) {
      budget = "Unknown";
    } else {
      budget = `$${budget}`;
    }
  }
  technologies = technologies.toLowerCase().replace(/,/g, ",");

  GIG.create({
    title,
    technologies,
    budget,
    description,
    contact_email,
  })
    .then(() => {
      res.redirect("/gigs");
    })
    .catch((err) => console.log(err));
};

exports.getSearch = (req, res) => {
  let { term } = req.query;
  let page = +req.query.page || 1;
  let totalItems;
  term.toLowerCase();
  function getURLByPage(page) {
    return getNewParamsParameter(req.query, "page", page);
  }

  function getNewURLBySort(sort) {
    return getNewParamsParameter(req.query, "sort", sort);
  }
  let findProps = {
    where: {
      technologies: {
        [Op.like]: "%" + term + "%",
      },
    },
    limit: items,
    offset: (page - 1) * items,
  };

  if (req.query.sort) findProps.order = [[req.query.sort, "ASC"]];

  GIG.count()
    .then((data) => {
      totalItems = data;
    })
    .catch((err) => console.log(err));
  GIG.findAll(findProps)
    .then((gigs) => {
      if (!gigs) {
        res.render("gigs/gigs", { error: "nothing found sorry" });
      } else {
        res.render("gigs/gigs", {
          gigs,
          currentPage: page,
          totalJobs: items,
          hasNextPage: items * page < totalItems,
          hasPrevPage: page > 1,
          nextPage: page + 1,
          prevPage: page - 1,
          lastPage: Math.ceil(totalItems / items),

          nextPageURL: getURLByPage(page + 1),
          prevPageURL: getURLByPage(page - 1),
          gigID: gigs.id,
          sortByBudgetURL: getNewURLBySort("budget"),
        });
      }
    })
    .catch((err) => console.log(err));
};

exports.sortByPrice = (req, res, next) => {
  let sort = req.params.sort;
  console.log(sort, "10000000000000000000000000000000000000000000000");
  let page = +req.query.page || 1;
  let totalItems;

  function getURLByPage(page) {
    return getNewParamsParameter(req.query, "page", page);
  }
  function getNewURLBySort(sort) {
    return getNewParamsParameter(req.query, "sort", sort);
  }
  GIG.count()
    .then((data) => {
      totalItems = data;
    })
    .catch((err) => console.log(err));

  let findProps = {
    limit: items,
    offset: (page - 1) * items,
  };

  if (req.query.sort) findProps.order = [[req.query.sort, "ASC"]];

  GIG.findAll(findProps).then((gigs) => {
    if (!gigs || gigs === [] || gigs === "") {
      res.render("gigs/gigs.ejs", {
        error: "no job is avaliable right now ! sorry",
      });
      console.log("no job");
    } else {
      res.render("gigs/gigs.ejs", {
        gigs,
        currentPage: page,
        totalJobs: items,
        hasNextPage: items * page < totalItems,
        hasPrevPage: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        lastPage: Math.ceil(totalItems / items),
        nextPageURL: getURLByPage(page + 1),
        prevPageURL: getURLByPage(page - 1),
        gigID: gigs.id,
        sortByBudgetURL: getNewURLBySort("budget"),
      });
    }
  });
};
exports.deleteGig = (req, res) => {
  const id = req.params.id;

  GIG.findOne({ where: { id } })
    .then((data) => {
      if (!data) {
        res.redirect("/404");
      } else {
        GIG.destroy({ where: { id } });
        console.log("here");
        console.log("deleted");
        res.status(200).json({ message: "deleted" });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: "failed" });
    });
};
