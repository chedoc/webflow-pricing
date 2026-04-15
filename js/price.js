const planPricesUrl = "https://api2.chedoc.com/api/planPrices";
let planPricesData = [];
let _PLAN_TYPE = "Mensual";

const queryString = window.location.search;
const URLSearchParams_wb = new URLSearchParams(queryString);
const utmElement = "country";

let urlCountry;
if (URLSearchParams_wb.has(utmElement)) {
  urlCountry = URLSearchParams_wb.get(utmElement);
}

const fetchPlanPrices = async () => {
  const url = urlCountry
    ? `${planPricesUrl}?country=${urlCountry}`
    : planPricesUrl;

  const response = await fetch(url);
  planPricesData = await response.json();
};

window.onload = async () => {
  const _AGENDAS_COUNT = 1;

  await fetchPlanPrices();

  // plan type (tabs) logic
  const planTypeTabs = document.getElementsByClassName(
    "pricing16_tabs-menu w-tab-menu",
  )[0];

  const updatePlanType = () => {
    if (!planTypeTabs) return;

    for (const opt of planTypeTabs.children) {
      const classes = opt.getAttribute("class") || "";
      if (classes.includes("w--current")) {
        _PLAN_TYPE = opt.getAttribute("data-w-tab");
      }
    }
  };

  updatePlanType();

  // plan prices (boxes) logic
  const planBoxes = document.getElementsByClassName(
    "price-plans-tabs w-tab-pane",
  );

  const updatePlanPrices = () => {
    // remove any previous .iva-tag
    const ivaTextElems = document.querySelectorAll(".iva-tag");
    ivaTextElems.forEach((element) => {
      element.remove();
    });

    for (const opt of planBoxes) {
      const planMode = opt.getAttribute("data-w-tab");
      const planTypes = opt.getElementsByClassName("heading-style-h6");
      const planPrices = opt.getElementsByClassName("heading-style-h1");
      let i = 0;

      for (const p of planTypes) {
        const planType = p.innerText.trim();
        let formattedNewPrice = "Consultar";
        let matchedPlanData = null;

        planPricesData.forEach((planData) => {
          if (
            _AGENDAS_COUNT >= planData.minAgendas &&
            _AGENDAS_COUNT <= planData.maxAgendas &&
            planType.includes(planData?.subscriptionPlan?.name)
          ) {
            matchedPlanData = planData;

            let newPrice =
              planData.country === "ARG"
                ? planData.price
                : planData.priceWithTax;

            if (planMode === "Anual") {
              const annualPrice =
                newPrice * 12 * (1 - planData.annualDiscountPerc);
              newPrice = annualPrice / 12;
            }

            newPrice = new Intl.NumberFormat(
              planData.country === "ARG" ? "es-ES" : "en",
            ).format(Math.round(newPrice));

            formattedNewPrice = `$${newPrice}`;
          }
        });

        if (planPrices[i]) {
          planPrices[i].childNodes[0].nodeValue = formattedNewPrice;

          if (matchedPlanData?.country === "ARG") {
            const ivaTextElem = document.createElement("span");
            ivaTextElem.classList.add("iva-tag");
            ivaTextElem.style.color = "#777";
            ivaTextElem.style.fontSize = "1.25rem";
            ivaTextElem.style.fontWeight = "700";
            ivaTextElem.style.lineHeight = "1.4";
            ivaTextElem.style.margin = "0px 0px 0px 10px";
            ivaTextElem.append("+ IVA");
            planPrices[i].appendChild(ivaTextElem);
          }
        }

        i++;
      }
    }
  };

  updatePlanPrices();

  if (planTypeTabs) {
    planTypeTabs.addEventListener("click", () => {
      setTimeout(() => {
        updatePlanType();
        updatePlanPrices();
      }, 50);
    });
  }
};
