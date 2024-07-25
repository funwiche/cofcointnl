const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const app = express();
const products = require("./resources/products.json");
const categories = require("./resources/categories.json");
// Download
const axios = require("axios");
const fs = require("fs");
const path = require("path");
// Download Routes
function get_path(str) {
  str = str.split("?")[0];
  str = str.split("cofcointernational.com")[1];
  return `public${str}`;
}
const downloadFile = async (url, downloadPath) => {
  const writer = fs.createWriteStream(downloadPath);
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};
const downloadFolder = async (routes) => {
  for (const route of routes) {
    const index = routes.indexOf(route) + 1;
    const last = routes.length;
    const downloadPath = get_path(route);
    fs.mkdirSync(path.dirname(downloadPath), { recursive: true });
    try {
      await downloadFile(route, downloadPath);
      console.log(`${index}/${last}`);
      if (index >= last) return console.log("complete!");
    } catch (error) {
      console.error(`Error downloading ${route}:`, error.message);
    }
  }
};
// Global Middlewares
app.use(express.json());
app.use((req, res, next) => {
  res.locals.categories = categories;
  res.locals.api = "https://cofcointnl.web.app";
  const routes = app._router.stack.map((middleware) => middleware.route);
  res.locals.routes = routes.filter((el) => el).map((el) => el.path);
  next();
});
// Set the view engine to EJS
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("layout", "./partials/layout.ejs");
app.use("", express.static("public"));
app.get("", (req, res) =>
  res.render("index", {
    title:
      "A global agri-business driven by our people, ambition and entrepreneurial spirit",
    path: "/",
  })
);
app.get("/show-routes", (req, res) => {
  res.render("routes", { title: "All routes", path: "/show-routes" });
});
app.get("/download-file", async (req, res) => {
  try {
    let { uri } = req.query;
    if (!uri) return res.sendStatus(500);
    const routes = JSON.parse(uri);
    fs.readFile("routes.json", "utf8", (err, data) => {
      if (err) return console.log(err);
      data = [...JSON.parse(data), ...routes];
      data = JSON.stringify([...new Set(data)]);
      fs.writeFile("routes.json", data, "utf8", () => null);
    });
    await downloadFolder(routes);
    res.sendStatus(200);
  } catch (error) {
    console.error(error.message);
    res.sendStatus(500);
  }
});
/// #################################################### //
/// WebView
app.get("/products", (req, res) => {
  res.render("products-archive", {
    title: "Products - COFCO International",
    path: `/products`,
    page: req.query.page || 1,
  });
});
app.get("/products/:cat", (req, res) => {
  const { cat } = req.params;
  const item = categories.find((el) => el.slug == cat);
  if (!item)
    return res.render("404", {
      title: "Product not found",
      path: `/products/${cat}`,
    });
  res.render("products-archive", {
    title: item.name + " - COFCO International",
    path: `/products/${cat}`,
    page: req.query.page || 1,
  });
});
app.get("/products/:cat/:id", async (req, res) => {
  const { id, cat } = req.params;
  try {
    const item = categories.find((el) => el.slug == cat);
    if (!item) throw Error();
    const product = products.find((el) => el.id == id);
    if (!product) throw Error();
    res.render("products-single", {
      title: product.title + " - COFCO International",
      path: `/products/${cat}/${id}`,
    });
  } catch (error) {
    res.render("404", {
      title: "Product not found",
      path: `/products/${cat}/${id}`,
    });
  }
});

app.get("/extranet", (req, res) =>
  res.render("products-archive", {
    title: "Dashboard - COFCO International",
    path: "/extranet",
  })
);
app.get("/contact-us", (req, res) =>
  res.render("contact-us", {
    title: "Contact Us  - COFCO International",
    path: "/contact-us",
  })
);
/// #################################################### //
app.get("/search", (req, res) =>
  res.render("search", {
    title: "Search  - COFCO International",
    path: "/search",
  })
);
app.get("/newsroom", (req, res) =>
  res.render("newsroom", {
    title: "Newsroom  - COFCO International",
    path: "/newsroom",
  })
);
app.get("/accessibility", (req, res) =>
  res.render("accessibility", {
    title: "Accessibility  - COFCO International",
    path: "/accessibility",
  })
);

app.get("/cookie-policy", (req, res) =>
  res.render("cookie-policy", {
    title: "Cookie Policy  - COFCO International",
    path: "/cookie-policy",
  })
);
app.get("/data-privacy-policy", (req, res) =>
  res.render("data-privacy-policy", {
    title: "Data privacy policy  - COFCO International",
    path: "/data-privacy-policy",
  })
);
app.get("/integrity-hotline/english", (req, res) =>
  res.render("integrity-hotline_english", {
    title: "English - Integrity Hotline - COFCO International",
    path: "/integrity-hotline/english",
  })
);
app.get("/legal-disclaimer", (req, res) =>
  res.render("legal-disclaimer", {
    title: "Legal disclaimer  - COFCO International",
    path: "/legal-disclaimer",
  })
);
app.get("/modern-slavery-statement", (req, res) =>
  res.render("modern-slavery-statement", {
    title: "Modern Slavery Statement  - COFCO International",
    path: "/modern-slavery-statement",
  })
);
app.get("/procurement-gtcs", (req, res) =>
  res.render("procurement-gtcs", {
    title: "Procurement GT&Cs  - COFCO International",
    path: "/procurement-gtcs",
  })
);
app.get("/services", (req, res) =>
  res.render("services", {
    title: "Services  - COFCO International",
    path: "/services",
  })
);
app.get("/services/coffee", (req, res) => {
  const items = products.filter((el) => el.cat == "coffee");
  res.render("services_coffee", {
    title: "Coffee - Services - COFCO International",
    path: "/services/coffee",
    items,
  });
});
app.get("/services/cotton", (req, res) => {
  const items = products.filter((el) => el.cat == "cotton");
  res.render("services_cotton", {
    title: "Cotton - Services - COFCO International",
    path: "/services/cotton",
    items,
  });
});
app.get("/services/freight", (req, res) =>
  res.render("services_freight", {
    title: "Freight - Services - COFCO International",
    path: "/services/freight",
  })
);
app.get("/services/grains-oilseeds", (req, res) => {
  const items = products.filter((el) => el.cat == "grains-oilseeds");
  res.render("services_grains-oilseeds", {
    title: "Grains & oilseeds - Services - COFCO International",
    path: "/services/grains-oilseeds",
    items,
  });
});
app.get("/services/sugar", (req, res) => {
  const items = products.filter((el) => el.cat == "sugar");
  res.render("services_sugar", {
    title: "Sugar - Services - COFCO International",
    path: "/services/sugar",
    items,
  });
});
app.get("/sustainability", (req, res) =>
  res.render("sustainability", {
    title: "Sustainability  - COFCO International",
    path: "/sustainability",
  })
);
app.get("/sustainability/building-strong-communities", (req, res) =>
  res.render("sustainability_building-strong-communities", {
    title: "Building strong communities - Sustainability - COFCO International",
    path: "/sustainability/building-strong-communities",
  })
);
app.get(
  "/sustainability/connecting-supply-and-demand-responsibly",
  (req, res) =>
    res.render("sustainability_connecting-supply-and-demand-responsibly", {
      title:
        "Connecting supply and demand responsibly - Sustainability - COFCO International",
      path: "/sustainability/connecting-supply-and-demand-responsibly",
    })
);
app.get(
  "/sustainability/connecting-supply-and-demand-responsibly/coffee",
  (req, res) =>
    res.render(
      "sustainability_connecting-supply-and-demand-responsibly_coffee",
      {
        title:
          "Coffee - Connecting supply and demand responsibly - Sustainability - COFCO International",
        path: "/sustainability/connecting-supply-and-demand-responsibly/coffee",
      }
    )
);
app.get(
  "/sustainability/connecting-supply-and-demand-responsibly/palm-oil",
  (req, res) =>
    res.render(
      "sustainability_connecting-supply-and-demand-responsibly_palm-oil",
      {
        title:
          "Palm oil - Connecting supply and demand responsibly - Sustainability - COFCO International",
        path: "/sustainability/connecting-supply-and-demand-responsibly/palm-oil",
      }
    )
);
app.get(
  "/sustainability/connecting-supply-and-demand-responsibly/soybean",
  (req, res) =>
    res.render(
      "sustainability_connecting-supply-and-demand-responsibly_soybean",
      {
        title:
          "Soybean - Connecting supply and demand responsibly - Sustainability - COFCO International",
        path: "/sustainability/connecting-supply-and-demand-responsibly/soybean",
      }
    )
);
app.get(
  "/sustainability/connecting-supply-and-demand-responsibly/sugar",
  (req, res) =>
    res.render(
      "sustainability_connecting-supply-and-demand-responsibly_sugar",
      {
        title:
          "Sugar - Connecting supply and demand responsibly - Sustainability - COFCO International",
        path: "/sustainability/connecting-supply-and-demand-responsibly/sugar",
      }
    )
);
app.get("/sustainability/managing-our-environmental-impact", (req, res) =>
  res.render("sustainability_managing-our-environmental-impact", {
    title:
      "Managing our environmental impact - Sustainability - COFCO International",
    path: "/sustainability/managing-our-environmental-impact",
  })
);
app.get("/sustainability/our-partnerships-and-memberships", (req, res) =>
  res.render("sustainability_our-partnerships-and-memberships", {
    title:
      "Our partnerships and memberships - Sustainability - COFCO International",
    path: "/sustainability/our-partnerships-and-memberships",
  })
);
app.get("/sustainability/our-policies", (req, res) =>
  res.render("sustainability_our-policies", {
    title: "Our policies - Sustainability - COFCO International",
    path: "/sustainability/our-policies",
  })
);
app.get("/sustainability/sustainability-reporting", (req, res) =>
  res.render("sustainability_sustainability-reporting", {
    title: "Sustainability Reporting - Sustainability - COFCO International",
    path: "/sustainability/sustainability-reporting",
  })
);
app.get(
  "/sustainability/sustainability-reporting/2017-sustainability-report",
  (req, res) =>
    res.render(
      "sustainability_sustainability-reporting_2017-sustainability-report",
      {
        title:
          "2017 Sustainability Report - Sustainability Reporting - Sustainability - COFCO International",
        path: "/sustainability/sustainability-reporting/2017-sustainability-report",
      }
    )
);
app.get(
  "/sustainability/sustainability-reporting/2018-sustainability-report",
  (req, res) =>
    res.render(
      "sustainability_sustainability-reporting_2018-sustainability-report",
      {
        title:
          "2018 Sustainability Report - Sustainability Reporting - Sustainability - COFCO International",
        path: "/sustainability/sustainability-reporting/2018-sustainability-report",
      }
    )
);
app.get(
  "/sustainability/sustainability-reporting/2019-sustainability-report",
  (req, res) =>
    res.render(
      "sustainability_sustainability-reporting_2019-sustainability-report",
      {
        title:
          "2019 Sustainability Report - Sustainability Reporting - Sustainability - COFCO International",
        path: "/sustainability/sustainability-reporting/2019-sustainability-report",
      }
    )
);
app.get(
  "/sustainability/sustainability-reporting/2020-sustainability-report",
  (req, res) =>
    res.render(
      "sustainability_sustainability-reporting_2020-sustainability-report",
      {
        title:
          "2020 Sustainability Report - Sustainability Reporting - Sustainability - COFCO International",
        path: "/sustainability/sustainability-reporting/2020-sustainability-report",
      }
    )
);
app.get(
  "/sustainability/sustainability-reporting/2021-sustainability-report",
  (req, res) =>
    res.render(
      "sustainability_sustainability-reporting_2021-sustainability-report",
      {
        title:
          "2021 Sustainability Report - Sustainability Reporting - Sustainability - COFCO International",
        path: "/sustainability/sustainability-reporting/2021-sustainability-report",
      }
    )
);
app.get(
  "/sustainability/sustainability-reporting/2022-sustainability-report",
  (req, res) =>
    res.render(
      "sustainability_sustainability-reporting_2022-sustainability-report",
      {
        title:
          "2022 Sustainability Report - Sustainability Reporting - Sustainability - COFCO International",
        path: "/sustainability/sustainability-reporting/2022-sustainability-report",
      }
    )
);
app.get(
  "/sustainability/sustainability-reporting/soft-commodities-forum-reporting",
  (req, res) =>
    res.render(
      "sustainability_sustainability-reporting_soft-commodities-forum-reporting",
      {
        title:
          "Soft Commodities Forum reporting - Sustainability Reporting - Sustainability - COFCO International",
        path: "/sustainability/sustainability-reporting/soft-commodities-forum-reporting",
      }
    )
);
app.get("/sustainability/taking-care-of-our-people", (req, res) =>
  res.render("sustainability_taking-care-of-our-people", {
    title: "Taking care of our people - Sustainability - COFCO International",
    path: "/sustainability/taking-care-of-our-people",
  })
);
app.get(
  "/sustainability/taking-care-of-our-people/diversity-and-human-rights",
  (req, res) =>
    res.render(
      "sustainability_taking-care-of-our-people_diversity-and-human-rights",
      {
        title:
          "Diversity and Human Rights - Taking care of our people - Sustainability - COFCO International",
        path: "/sustainability/taking-care-of-our-people/diversity-and-human-rights",
      }
    )
);
app.get(
  "/sustainability/taking-care-of-our-people/health-and-safety",
  (req, res) =>
    res.render("sustainability_taking-care-of-our-people_health-and-safety", {
      title:
        "Health and Safety - Taking care of our people - Sustainability - COFCO International",
      path: "/sustainability/taking-care-of-our-people/health-and-safety",
    })
);
app.get("/sustainability/upholding-standards", (req, res) =>
  res.render("sustainability_upholding-standards", {
    title: "Upholding standards - Sustainability - COFCO International",
    path: "/sustainability/upholding-standards",
  })
);
app.get(
  "/sustainability/upholding-standards/certification-and-verification",
  (req, res) =>
    res.render(
      "sustainability_upholding-standards_certification-and-verification",
      {
        title:
          "Certification and Verification - Upholding standards - Sustainability - COFCO International",
        path: "/sustainability/upholding-standards/certification-and-verification",
      }
    )
);
app.get("/who-we-are", (req, res) =>
  res.render("who-we-are", {
    title: "Who we are  - COFCO International",
    path: "/who-we-are",
  })
);
app.get("/who-we-are/board-leadership", (req, res) =>
  res.render("who-we-are_board-leadership", {
    title: "Board & Leadership - Who we are - COFCO International",
    path: "/who-we-are/board-leadership",
  })
);
app.get("/who-we-are/corporate-governance", (req, res) =>
  res.render("who-we-are_corporate-governance", {
    title: "Corporate governance - Who we are - COFCO International",
    path: "/who-we-are/corporate-governance",
  })
);
app.get("/who-we-are/how-we-work", (req, res) =>
  res.render("who-we-are_how-we-work", {
    title: "How we work - Who we are - COFCO International",
    path: "/who-we-are/how-we-work",
  })
);
app.get("/integrity-hotline/english", (req, res) =>
  res.render("integrity-hotline_english", {
    title: "English - Integrity Hotline - COFCO International",
    path: "/integrity-hotline/english",
  })
);
app.get("/who-we-are/our-investors", (req, res) =>
  res.render("who-we-are_our-investors", {
    title: "Our investors - Who we are - COFCO International",
    path: "/who-we-are/our-investors",
  })
);
app.get("/who-we-are/our-story", (req, res) =>
  res.render("who-we-are_our-story", {
    title: "Our story - Who we are - COFCO International",
    path: "/who-we-are/our-story",
  })
);
app.get("/who-we-are/our-strategy", (req, res) =>
  res.render("who-we-are_our-strategy", {
    title: "Our strategy - Who we are - COFCO International",
    path: "/who-we-are/our-strategy",
  })
);
app.get("/who-we-are/our-vision-and-culture", (req, res) =>
  res.render("who-we-are_our-vision-and-culture", {
    title: "Our vision and culture - Who we are - COFCO International",
    path: "/who-we-are/our-vision-and-culture",
  })
);
app.get("/who-we-are/risk-management", (req, res) =>
  res.render("who-we-are_risk-management", {
    title: "Risk management - Who we are - COFCO International",
    path: "/who-we-are/risk-management",
  })
);
app.get("/who-we-are/what-we-do", (req, res) =>
  res.render("who-we-are_what-we-do", {
    title: "What we do - Who we are - COFCO International",
    path: "/who-we-are/what-we-do",
  })
);
app.get(
  "/newsroom/cofco-international-board-appoints-dr-martin-fritsch-as-new-director",
  (req, res) =>
    res.render(
      "newsroom_cofco-international-board-appoints-dr-martin-fritsch-as-new-director",
      {
        title:
          "COFCO International Board appoints Dr. Martin Fritsch as New Director - Newsroom - COFCO International",
        path: "/newsroom/cofco-international-board-appoints-dr-martin-fritsch-as-new-director",
      }
    )
);
app.get(
  "/newsroom/cofco-international-to-supply-deforestation-free-soybeans-from-brazil-to-sheng-mu-in-china",
  (req, res) =>
    res.render(
      "newsroom_cofco-international-to-supply-deforestation-free-soybeans-from-brazil-to-sheng-mu-in-china",
      {
        title:
          "COFCO International to supply deforestation-free soybeans from Brazil to Sheng Mu in China - Newsroom - COFCO International",
        path: "/newsroom/cofco-international-to-supply-deforestation-free-soybeans-from-brazil-to-sheng-mu-in-china",
      }
    )
);
app.get(
  "/newsroom/improving-community-relations-inside-cofco-international-s-sustainability-ambassador-network",
  (req, res) =>
    res.render(
      "newsroom_improving-community-relations-inside-cofco-international-s-sustainability-ambassador-network",
      {
        title:
          "Improving community relations: Inside COFCO International’s Sustainability Ambassador Network - Newsroom - COFCO International",
        path: "/newsroom/improving-community-relations-inside-cofco-international-s-sustainability-ambassador-network",
      }
    )
);
app.get(
  "/newsroom/cofco-international-responsible-agriculture-standard-passes-european-feed-industry-benchmark",
  (req, res) =>
    res.render(
      "newsroom_cofco-international-responsible-agriculture-standard-passes-european-feed-industry-benchmark",
      {
        title:
          "COFCO International Responsible Agriculture Standard passes European Feed Industry Benchmark - Newsroom - COFCO International",
        path: "/newsroom/cofco-international-responsible-agriculture-standard-passes-european-feed-industry-benchmark",
      }
    )
);
app.get(
  "/newsroom/cofco-international-wins-gold-for-best-corporate-website-award",
  (req, res) =>
    res.render(
      "newsroom_cofco-international-wins-gold-for-best-corporate-website-award",
      {
        title:
          "COFCO International wins gold for best corporate website award - Newsroom - COFCO International",
        path: "/newsroom/cofco-international-wins-gold-for-best-corporate-website-award",
      }
    )
);
app.get(
  "/newsroom/cofco-international-and-mengniu-group-sign-mou-for-first-trade-of-deforestation-free-soybeans-from-brazil-to-china",
  (req, res) =>
    res.render(
      "newsroom_cofco-international-and-mengniu-group-sign-mou-for-first-trade-of-deforestation-free-soybeans-from-brazil-to-china",
      {
        title:
          "COFCO International and Mengniu Group sign MOU for first trade of ‘deforestation-free’ soybeans from Brazil to China - Newsroom - COFCO International",
        path: "/newsroom/cofco-international-and-mengniu-group-sign-mou-for-first-trade-of-deforestation-free-soybeans-from-brazil-to-china",
      }
    )
);
app.get(
  "/newsroom/cofco-international-commits-to-science-based-climate-targets",
  (req, res) =>
    res.render(
      "newsroom_cofco-international-commits-to-science-based-climate-targets",
      {
        title:
          "COFCO International commits to Science-Based Climate Targets - Newsroom - COFCO International",
        path: "/newsroom/cofco-international-commits-to-science-based-climate-targets",
      }
    )
);
app.get(
  "/newsroom/cofco-international-commits-to-cut-freight-emissions-through-operational-efficiency",
  (req, res) =>
    res.render(
      "newsroom_cofco-international-commits-to-cut-freight-emissions-through-operational-efficiency",
      {
        title:
          "COFCO International commits to cut freight emissions through operational efficiency - Newsroom - COFCO International",
        path: "/newsroom/cofco-international-commits-to-cut-freight-emissions-through-operational-efficiency",
      }
    )
);
app.get(
  "/newsroom/buhle-academy-empowering-south-african-smallholders",
  (req, res) =>
    res.render("newsroom_buhle-academy-empowering-south-african-smallholders", {
      title:
        "Buhle Academy: empowering South African smallholders - Newsroom - COFCO International",
      path: "/newsroom/buhle-academy-empowering-south-african-smallholders",
    })
);
app.get(
  "/newsroom/cofco-international-starts-construction-on-santos-port-terminal-expansion",
  (req, res) =>
    res.render(
      "newsroom_cofco-international-starts-construction-on-santos-port-terminal-expansion",
      {
        title:
          "COFCO International starts construction on Santos port terminal expansion - Newsroom - COFCO International",
        path: "/newsroom/cofco-international-starts-construction-on-santos-port-terminal-expansion",
      }
    )
);
app.get(
  "/newsroom/cofco-international-receives-industry-leading-sustainalytics-esg-score",
  (req, res) =>
    res.render(
      "newsroom_cofco-international-receives-industry-leading-sustainalytics-esg-score",
      {
        title:
          "COFCO International receives industry-leading Sustainalytics ESG score - Newsroom - COFCO International",
        path: "/newsroom/cofco-international-receives-industry-leading-sustainalytics-esg-score",
      }
    )
);
app.get(
  "/newsroom/cofco-international-appoints-gonzalo-ramirez-martiarena-to-its-board-of-directors",
  (req, res) =>
    res.render(
      "newsroom_cofco-international-appoints-gonzalo-ramirez-martiarena-to-its-board-of-directors",
      {
        title:
          "COFCO International appoints Gonzalo Ramirez Martiarena to its Board of Directors - Newsroom - COFCO International",
        path: "/newsroom/cofco-international-appoints-gonzalo-ramirez-martiarena-to-its-board-of-directors",
      }
    )
);
app.get(
  "/newsroom/cofco-international-publishes-its-2022-sustainability-report",
  (req, res) =>
    res.render(
      "newsroom_cofco-international-publishes-its-2022-sustainability-report",
      {
        title:
          "COFCO International publishes its 2022 Sustainability Report - Newsroom - COFCO International",
        path: "/newsroom/cofco-international-publishes-its-2022-sustainability-report",
      }
    )
);
app.get(
  "/newsroom/determination-and-a-drive-to-learn-the-journey-to-becoming-a-leading-woman-food-technician",
  (req, res) =>
    res.render(
      "newsroom_determination-and-a-drive-to-learn-the-journey-to-becoming-a-leading-woman-food-technician",
      {
        title:
          "Determination and a drive to learn: The journey to becoming a leading woman food technician - Newsroom - COFCO International",
        path: "/newsroom/determination-and-a-drive-to-learn-the-journey-to-becoming-a-leading-woman-food-technician",
      }
    )
);
app.get("/newsroom/meet-the-wonder-oil-castor-oil", (req, res) =>
  res.render("newsroom_meet-the-wonder-oil-castor-oil", {
    title: "Meet the wonder oil: castor oil - Newsroom - COFCO International",
    path: "/newsroom/meet-the-wonder-oil-castor-oil",
  })
);
app.get(
  "/newsroom/cofco-international-kicks-off-climate-strategy-development",
  (req, res) =>
    res.render(
      "newsroom_cofco-international-kicks-off-climate-strategy-development",
      {
        title:
          "COFCO International kicks off climate strategy development - Newsroom - COFCO International",
        path: "/newsroom/cofco-international-kicks-off-climate-strategy-development",
      }
    )
);
app.get(
  "/newsroom/cofco-international-appoints-xuanyi-song-as-cfo",
  (req, res) =>
    res.render("newsroom_cofco-international-appoints-xuanyi-song-as-cfo", {
      title:
        "COFCO International appoints Xuanyi Song as CFO - Newsroom - COFCO International",
      path: "/newsroom/cofco-international-appoints-xuanyi-song-as-cfo",
    })
);
app.get(
  "/newsroom/cofco-international-s-new-16-billion-loan-brings-savings-to-fund-further-sustainability-work",
  (req, res) =>
    res.render(
      "newsroom_cofco-international-s-new-16-billion-loan-brings-savings-to-fund-further-sustainability-work",
      {
        title:
          "COFCO International’s new $1.6 billion loan brings savings to fund further sustainability work - Newsroom - COFCO International",
        path: "/newsroom/cofco-international-s-new-16-billion-loan-brings-savings-to-fund-further-sustainability-work",
      }
    )
);
app.get(
  "/newsroom/cofco-international-completes-new-sustainability-linked-loan-deal",
  (req, res) =>
    res.render(
      "newsroom_cofco-international-completes-new-sustainability-linked-loan-deal",
      {
        title:
          "COFCO International completes new sustainability-linked loan deal - Newsroom - COFCO International",
        path: "/newsroom/cofco-international-completes-new-sustainability-linked-loan-deal",
      }
    )
);
app.get(
  "/newsroom/shippers-commit-to-measure-and-disclose-emissions-giving-unprecedented-insight-into-climate-impact",
  (req, res) =>
    res.render(
      "newsroom_shippers-commit-to-measure-and-disclose-emissions-giving-unprecedented-insight-into-climate-impact",
      {
        title:
          "Shippers commit to measure and disclose emissions, giving unprecedented insight into climate impact - Newsroom - COFCO International",
        path: "/newsroom/shippers-commit-to-measure-and-disclose-emissions-giving-unprecedented-insight-into-climate-impact",
      }
    )
);
app.get("/newsroom/the-importance-of-tracing-the-supply-chain", (req, res) =>
  res.render("newsroom_the-importance-of-tracing-the-supply-chain", {
    title:
      "The importance of tracing the supply chain - Newsroom - COFCO International",
    path: "/newsroom/the-importance-of-tracing-the-supply-chain",
  })
);
app.get(
  "/newsroom/partnering-to-reduce-the-carbon-footprint-of-coffee",
  (req, res) =>
    res.render("newsroom_partnering-to-reduce-the-carbon-footprint-of-coffee", {
      title:
        "Partnering to reduce the carbon footprint of coffee - Newsroom - COFCO International",
      path: "/newsroom/partnering-to-reduce-the-carbon-footprint-of-coffee",
    })
);
app.get(
  "/newsroom/cofco-international-publishes-its-2021-sustainability-report",
  (req, res) =>
    res.render(
      "newsroom_cofco-international-publishes-its-2021-sustainability-report",
      {
        title:
          "COFCO International publishes its 2021 Sustainability Report - Newsroom - COFCO International",
        path: "/newsroom/cofco-international-publishes-its-2021-sustainability-report",
      }
    )
);
app.get("/newsroom/setting-your-trading-strategy", (req, res) =>
  res.render("newsroom_setting-your-trading-strategy", {
    title: "Setting your trading strategy - Newsroom - COFCO International",
    path: "/newsroom/setting-your-trading-strategy",
  })
);
app.get("**", (req, res) =>
  res.render("404", {
    title: "Page not found",
    path: "**",
  })
);

// Download assets
// downloadFolder();

// Start app
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`http://localhost:${port}`));
