const planPricesUrl = "https://api2.chedoc.com/api/planPrices";
let planPricesData = [];
let _PLAN_TYPE = "Mensual";
let pricingInitialized = false;

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

const isPlansPage = () => {
  return window.location.pathname === "/planes";
};

const initPricingWithSlider = async () => {
  let _AGENDAS_COUNT = 1;
  await fetchPlanPrices();

  const slider = document.getElementsByClassName("fs-rangeslider_handle-1")[0];
  const sliderWrapper = document.getElementsByClassName(
    "fs-rangeslider_wrapper-1",
  )[0];
  const sliderBottomData =
    document.getElementsByClassName("price-slider-data")[0];

  const updateAgendasCount = () => {
    const sliderValue = slider.getAttribute("aria-valuenow");
    _AGENDAS_COUNT = parseInt(sliderValue);
    const sliderValueText = `${sliderValue} Agenda${
      sliderValue > 1 ? "s" : ""
    }`;
    sliderBottomData.children[1].innerHTML = sliderValueText;
  };
  updateAgendasCount();

  sliderWrapper.addEventListener("change", () => {
    updateAgendasCount();
    updatePlanPrices();
  });

  const planTypeTabs = document.getElementsByClassName(
    "pricing16_tabs-menu w-tab-menu",
  )[0];

  const updatePlanType = () => {
    for (const opt of planTypeTabs.children) {
      const classes = opt.getAttribute("class");
      if (classes.includes("w--current")) {
        _PLAN_TYPE = opt.getAttribute("data-w-tab");
      }
    }
  };
  updatePlanType();

  planTypeTabs.addEventListener("click", () => {
    updatePlanType();
  });

  const planBoxes = document.getElementsByClassName(
    "price-plans-tabs w-tab-pane",
  );

  const updatePlanPrices = () => {
    let ivaTextElems = document.querySelectorAll(".iva-tag");
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
        planPricesData.forEach((planData) => {
          if (
            _AGENDAS_COUNT >= planData.minAgendas &&
            _AGENDAS_COUNT <= planData.maxAgendas &&
            planType.includes(planData?.subscriptionPlan?.name)
          ) {
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
            planPrices[i].childNodes[0].nodeValue = formattedNewPrice;

            if (planData.country === "ARG") {
              ivaTextElem = document.createElement("span");
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
        });

        i++;
      }
    }
  };
  updatePlanPrices();
};

const initPricingOptimized = async () => {
  if (pricingInitialized) return;
  pricingInitialized = true;

  const _AGENDAS_COUNT = 1;

  await fetchPlanPrices();

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

  const planBoxes = document.getElementsByClassName(
    "price-plans-tabs w-tab-pane",
  );

  const updatePlanPrices = () => {
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

const initPricing = async () => {
  if (isPlansPage()) {
    await initPricingWithSlider();
  } else {
    await initPricingOptimized();
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPricing);
} else {
  initPricing();
}
