import { authorization, login, logout } from "../src/index";
import { fetch } from "@wwsc/lib-util";
import { stringify } from "csv-stringify/sync";
import { Big } from "big.js";

async function main() {
  await login();
  let allCategories = await categories();
  Bun.write("categories.json", JSON.stringify(allCategories, null, 2));
  console.log("categories", allCategories.length);

  let allProducts = await products();
  Bun.write("products.json", JSON.stringify(allProducts, null, 2));
  console.log("products", allProducts.length);

  let priceList = generatePriceList(allProducts, allCategories);
  Bun.write("price-list.json", JSON.stringify(priceList, null, 2));
  console.log("price list", priceList.length);

  let csv = stringify(priceList, { header: true });
  Bun.write("price-list.csv", csv);

  let promotions = generatePromotions(allProducts, allCategories);
  Bun.write("promotions.json", JSON.stringify(promotions, null, 2));
  Bun.write("promotions.csv", stringify(promotions, { header: true }));
  await logout();
}

async function products() {
  const url = `https://api.thegoodtill.com/api/products`;

  let response = await fetch(url, {
    method: "GET",
    headers: { ...authorization(), "content-type": "application/json" },
  });

  if (!response.ok) {
    console.error("failed to fetch products", response.statusText);
  }

  const products = await response.json();
  return products.data;
}

async function categories() {
  const url = `https://api.thegoodtill.com/api/categories`;

  let response = await fetch(url, {
    method: "GET",
    headers: { ...authorization(), "content-type": "application/json" },
  });

  if (!response.ok) {
    console.error("failed to fetch categories", response.statusText);
  }

  const categories = await response.json();
  return categories.data;
}

function findCategory(categories: any[], id: string) {
  let found = categories.find((category) => category.id === id);
  if (!found) {
    // console.error("category not found", id);
    return null;
  }
  return {
    category: found.category_name,
    parent: found.parent_category ? found.parent_category.category_name : null,
  };
}

function generatePriceList(products: any[], categories: any[]) {
  const priceList = products.map((product) => {
    let {
      id,
      product_name,
      display_name,
      product_sku,
      purchase_price,
      selling_price,
      category_id,
    } = product;
    let category = findCategory(categories, category_id);
    if (!category) {
      // console.error("category not found", product_name, category_id);
      return null;
    }
    return {
      id,
      name: product_name,
      display: display_name,
      sku: product_sku,
      purchase_price: +purchase_price,
      selling_price: +selling_price,
      category: category.category,
      parent: category.parent ? category.parent : "",
    };
  });

  // filter out Coupon / Voucher
  return priceList.filter((product) => product).sort((a, b) =>
    a?.category.localeCompare(b?.category)
  );
}

function generatePromotions(products: any[], categories: any[]) {
  const doubles = findPromotions(products, categories, "double");
  const singles = findPromotions(products, categories, "single");
  let singleDoublePairs = findSinglesFromDoubles(singles, doubles);

  let pints = findPromotions(products, categories, "pint");
  let jugs = findPromotions(products, categories, "jug");
  let jugPintPairs = findPintsFromJugs(pints, jugs);

  let matchdays = findPromotions(products, categories, "matchday");
  let matchdayPintPairs = findPintsFromMatchdays(pints, matchdays);

  let winePromo = findPromotions(products, categories, "promo");
  let wineBottle = findPromotions(products, categories, "bottle");
  let promoBottlePairs = findBottleFromPromo(wineBottle, winePromo);

  let fizzFriday = findPromotions(products, categories, "Fizz Friday");
  let fizzFridayPairs = findFizzFridayPairs(products, fizzFriday);

  let x2s = findPromotions(products, categories, "x2");
  let x2Pairs = findXPairs(products, x2s, "x2");

  let x3s = findPromotions(products, categories, "x3");
  let x3Pairs = findXPairs(products, x3s, "x3");

  let x10s = findPromotions(products, categories, "x10");
  let x10Pairs = findXPairs(products, x10s, "x10");

  let doubleDiscounts = discountsFromDoubles(singleDoublePairs);
  let jugDiscounts = discountsFromJugs(jugPintPairs);
  let matchdayDiscounts = discountsFromMatchdays(matchdayPintPairs);
  let bottleDiscounts = discountsFromBottles(promoBottlePairs);
  let fizzFridayDiscounts = discountsFromFizzFriday(fizzFridayPairs);
  let x2Discounts = discountsFromX(x2Pairs, 2);
  let x3Discounts = discountsFromX(x3Pairs, 3);
  let x10Discounts = discountsFromX(x10Pairs, 10);

  return doubleDiscounts
    .concat(jugDiscounts)
    .concat(matchdayDiscounts)
    .concat(x2Discounts)
    .concat(x3Discounts)
    .concat(x10Discounts)
    .concat(bottleDiscounts)
    .concat(fizzFridayDiscounts);
}

function findSinglesFromDoubles(singles: any[], doubles: any[]) {
  let pairs: any[] = [];
  doubles.forEach((double) => {
    let single = singles.find((single) =>
      single.name === double.name.replace("double", "single")
    );
    if (single) {
      pairs.push({
        double,
        single,
      });
    }

    if (!single) {
      console.error("single not found", double.product_name);
    }
  });
  return pairs;
}

function findPintsFromJugs(pints: any[], jugs: any[]) {
  let pairs: any[] = [];
  jugs.forEach((jug) => {
    let pint = pints.find((pint) =>
      pint.name === jug.name.replace("jug", "pint")
    );
    if (pint) {
      pairs.push({
        jug,
        pint,
      });
    }

    if (!pint) {
      console.error("pint not found", jug.product_name);
    }
  });
  return pairs;
}

function findPintsFromMatchdays(pints: any[], matchdays: any[]) {
  let pairs: any[] = [];
  matchdays.forEach((matchday) => {
    let pint = pints.find((pint) =>
      pint.name === matchday.name.replace("matchday", "pint")
    );
    if (pint) {
      pairs.push({
        matchday,
        pint,
      });
    }

    if (!pint) {
      console.error("pint not found", matchday.product_name);
    }
  });
  return pairs;
}

function findBottleFromPromo(bottles: any[], promos: any[]) {
  let pairs: any[] = [];
  promos.forEach((promo) => {
    let bottle = bottles.find((bottle) =>
      bottle.name === promo.name.replace("promo", "bottle")
    );
    if (bottle) {
      pairs.push({
        promo,
        bottle,
      });
    }

    if (!bottle) {
      console.error("promo not found", promo.product_name);
    }
  });
  return pairs;
}

function findFizzFridayPairs(products: any[], fizzFriday: any[]) {
  let pairs: any[] = [];
  fizzFriday.forEach((promo) => {
    let product = products.find((product) =>
      product.product_name === promo.name.replace(" (Fizz Friday)", "")
    );
    if (product) {
      pairs.push({
        promo,
        product,
      });
    }

    if (!product) {
      console.error("product not found", promo.product_name);
    }
  });
  return pairs;
}

function findXPairs(products: any[], xs: any[], target: string) {
  let pairs: any[] = [];
  xs.forEach((promo) => {
    let product = products.find((product) =>
      product.product_name === promo.name.replace(` (${target})`, "")
    );
    if (product) {
      pairs.push({
        promo,
        product,
      });
    }

    if (!product) {
      console.error("product not found", promo.product_name);
    }
  });
  return pairs;
}

function discountsFromDoubles(pairs: any[]) {
  let discounts = pairs.map((pair) => {
    let { single, double } = pair;
    let RRP = new Big(single.selling_price).times(2).round(2).toNumber();
    let promoRRP = double.selling_price;
    let diff = Big(RRP).minus(promoRRP).round(2).toNumber();
    return {
      id: double.id,
      name: double.name,
      RRP,
      promoRRP,
      diff,
    };
  });
  return discounts;
}

function discountsFromJugs(pairs: any[]) {
  let discounts = pairs.map((pair) => {
    let { pint, jug } = pair;
    let RRP = new Big(pint.selling_price).times(4).round(2).toNumber();
    let promoRRP = jug.selling_price;
    let diff = Big(RRP).minus(promoRRP).round(2).toNumber();
    return {
      id: jug.id,
      name: jug.name,
      RRP,
      promoRRP,
      diff,
    };
  });
  return discounts;
}

function discountsFromMatchdays(pairs: any[]) {
  let discounts = pairs.map((pair) => {
    let { pint, matchday } = pair;
    let RRP = new Big(pint.selling_price).times(1).round(2).toNumber();
    let promoRRP = matchday.selling_price;
    let diff = Big(RRP).minus(promoRRP).round(2).toNumber();
    return {
      id: matchday.id,
      name: matchday.name,
      RRP,
      promoRRP,
      diff,
    };
  });
  return discounts;
}

function discountsFromBottles(pairs: any[]) {
  let discounts = pairs.map((pair) => {
    let { bottle, promo } = pair;
    let RRP = new Big(bottle.selling_price).times(1).round(2).toNumber();
    let promoRRP = promo.selling_price;
    let diff = Big(RRP).minus(promoRRP).round(2).toNumber();
    return {
      id: promo.id,
      name: promo.name,
      RRP,
      promoRRP,
      diff,
    };
  });
  return discounts;
}

function discountsFromFizzFriday(pairs: any[]) {
  let discounts = pairs.map((pair) => {
    let { product, promo } = pair;
    let RRP = new Big(product.selling_price).times(1).round(2).toNumber();
    let promoRRP = promo.selling_price;
    let diff = Big(RRP).minus(promoRRP).round(2).toNumber();
    return {
      id: promo.id,
      name: promo.name,
      RRP,
      promoRRP,
      diff,
    };
  });
  return discounts;
}

function discountsFromX(pairs: any[], multiplier: number) {
  let discounts = pairs.map((pair) => {
    let { product, promo } = pair;
    let RRP = new Big(product.selling_price).times(multiplier).round(2)
      .toNumber();
    let promoRRP = promo.selling_price;
    let diff = Big(RRP).minus(promoRRP).round(2).toNumber();
    return {
      id: promo.id,
      name: promo.name,
      RRP,
      promoRRP,
      diff,
    };
  });
  return discounts;
}

function findPromotions(
  products: any[],
  categories: any[],
  target: string,
) {
  const promotions = products.filter(
    (product) => product.product_name.includes(target),
  ).map((product) => {
    let {
      id,
      product_name,
      display_name,
      product_sku,
      purchase_price,
      selling_price,
      category_id,
    } = product;
    let category = findCategory(categories, category_id);
    if (!category) {
      return null;
    }
    return {
      id,
      name: product_name,
      display: display_name,
      sku: product_sku,
      purchase_price: +purchase_price,
      selling_price: +selling_price,
      category: category.category,
      parent: category.parent ? category.parent : "",
    };
  });

  // filter out Coupon / Voucher
  return promotions.filter((product) => product).sort((a, b) =>
    a?.category.localeCompare(b?.category)
  );
}
await main();
