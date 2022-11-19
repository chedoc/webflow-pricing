const planPricesUrl = "https://staging-api.chedoc.com/api/planPrices";
let planPricesData;

const fetchPlanPrices = async () => {
  let response = await fetch(planPricesUrl);
  planPricesData = await response.json();
};

window.onload = async () => {
  let _PLAN_TYPE = "Anual";
  let _AGENDAS_COUNT = 0;
  await fetchPlanPrices();

  // agendas count (slider) logic
  const slider = document.getElementsByClassName("fs-rangeslider_handle-1")[0];
  const sliderWrapper = document.getElementsByClassName(
    "fs-rangeslider_wrapper-1"
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

  // plan type (tabs) logic
  const planTypeTabs = document.getElementsByClassName(
    "pricing16_tabs-menu w-tab-menu"
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

  // plan prices (boxes) logic
  const planBoxes = document.getElementsByClassName(
    "price-plans-tabs w-tab-pane"
  );

  const updatePlanPrices = () => {
    for (const opt of planBoxes) {
      const planMode = opt.getAttribute("data-w-tab");
      const planTypes = opt.getElementsByClassName("heading-style-h6");
      const planPrices = opt.getElementsByClassName("heading-style-h1");
      let i = 0;

      for (const p of planTypes) {
        const planType = p.innerText.trim();

        // update price
        let formattedNewPrice = "Consultar";
        // console.log(planPrices);
        planPricesData.forEach((planData) => {
          if (
            _AGENDAS_COUNT >= planData.minAgendas &&
            _AGENDAS_COUNT <= planData.maxAgendas &&
            planType.includes(planData.name)
          ) {
            let newPrice = planData.priceWithTax;
            if (planMode === "Anual") {
              newPrice = newPrice * 12 * (1 - planData.annualDiscountPerc);
            }

            newPrice = new Intl.NumberFormat(
              planData.country === "ARG" ? "es-ES" : "en"
            ).format(Math.round(newPrice));

            formattedNewPrice = `$${newPrice}`;
            return;
          }

          planPrices[i].childNodes[0].nodeValue = formattedNewPrice;
        });

        i++;
      }
    }
  };
  updatePlanPrices();
};
