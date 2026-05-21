const planPricesUrl = "https://api2.chedoc.com/api/planPrices";
let planPricesData;
let _PLAN_TYPE = "Mensual";

let queryString = window.location.search;
let URLSearchParams_wb = new URLSearchParams(queryString);
let utmElement = "country";

let urlCountry;
if (URLSearchParams_wb.has(utmElement)) {
  urlCountry = URLSearchParams_wb.get(utmElement);
}

const fetchPlanPrices = async () => {
  console.log("🔄 Fetching plan prices...");
  const url = urlCountry
    ? `${planPricesUrl}?country=${urlCountry}`
    : planPricesUrl;
  let response = await fetch(url);
  planPricesData = await response.json();
  console.log("✅ Plan prices fetched:", planPricesData?.length, "items");
};

const isPlansPage = () => {
  return window.location.pathname === "/planes";
};

// ===== VERSION CON SLIDER (PARA /planes) =====
const initWithSlider = async () => {
  console.log("🎚️ Initializing WITH SLIDER (/planes)");
  let _AGENDAS_COUNT = 1;
  await fetchPlanPrices();

  const slider = document.getElementsByClassName("fs-rangeslider_handle-1")[0];
  const sliderWrapper = document.getElementsByClassName(
    "fs-rangeslider_wrapper-1",
  )[0];
  const sliderBottomData =
    document.getElementsByClassName("price-slider-data")[0];

  console.log("📊 Slider elements:", {
    slider: !!slider,
    sliderWrapper: !!sliderWrapper,
    sliderBottomData: !!sliderBottomData,
  });

  const updateAgendasCount = () => {
    const sliderValue = slider.getAttribute("aria-valuenow");
    _AGENDAS_COUNT = parseInt(sliderValue);
    const sliderValueText = `${sliderValue} Agenda${
      sliderValue > 1 ? "s" : ""
    }`;
    sliderBottomData.children[1].innerHTML = sliderValueText;
    console.log("📈 Agendas updated:", _AGENDAS_COUNT);
  };
  updateAgendasCount();

  sliderWrapper.addEventListener("change", () => {
    console.log("🔊 Slider change event triggered");
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
        console.log("💳 Plan type updated:", _PLAN_TYPE);
      }
    }
  };
  updatePlanType();

  planTypeTabs.addEventListener("click", () => {
    console.log("🔊 Tab click event triggered");
    updatePlanType();
  });

  const planBoxes = document.getElementsByClassName(
    "price-plans-tabs w-tab-pane",
  );

  console.log("📦 Plan boxes found:", planBoxes.length);

  const updatePlanPrices = () => {
    console.log(
      "💰 Updating plan prices... (_AGENDAS_COUNT:",
      _AGENDAS_COUNT + ")",
    );
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
        let found = false;

        planPricesData.forEach((planData) => {
          if (
            _AGENDAS_COUNT >= planData.minAgendas &&
            _AGENDAS_COUNT <= planData.maxAgendas &&
            planType.includes(planData?.subscriptionPlan?.name)
          ) {
            found = true;
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
            console.log("✏️ Updated:", planType, "->", formattedNewPrice);

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

        if (!found) {
          console.log(
            "⚠️ No match found for:",
            planType,
            "at agendas:",
            _AGENDAS_COUNT,
          );
        }

        i++;
      }
    }
  };
  updatePlanPrices();
};

// ===== VERSION OPTIMIZADA (SIN SLIDER) =====
const initOptimized = async () => {
  console.log("⚡ Initializing OPTIMIZED (other pages)");
  let _AGENDAS_COUNT = 1;
  await fetchPlanPrices();

  const planBoxes = document.getElementsByClassName(
    "price-plans-tabs w-tab-pane",
  );

  console.log("📦 Plan boxes found:", planBoxes.length);

  const updatePlanPrices = () => {
    console.log(
      "💰 Updating plan prices... (_AGENDAS_COUNT:",
      _AGENDAS_COUNT + ")",
    );
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
        let found = false;

        planPricesData.forEach((planData) => {
          if (
            _AGENDAS_COUNT >= planData.minAgendas &&
            _AGENDAS_COUNT <= planData.maxAgendas &&
            planType.includes(planData?.subscriptionPlan?.name)
          ) {
            found = true;
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
            console.log("✏️ Updated:", planType, "->", formattedNewPrice);

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

        if (!found) {
          console.log(
            "⚠️ No match found for:",
            planType,
            "at agendas:",
            _AGENDAS_COUNT,
          );
        }

        i++;
      }
    }
  };
  updatePlanPrices();
};

// ===== INICIALIZACIÓN CON DETECCIÓN DE RUTA =====
window.onload = async () => {
  console.log("🚀 Pricing script loaded. Path:", window.location.pathname);
  if (isPlansPage()) {
    await initWithSlider();
  } else {
    await initOptimized();
  }
};
