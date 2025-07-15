export interface ILayoutConfig {
  topComponent: string | null;
  userTableComponent: string | null;
  middleComponent: string | null;
  bottomComponent: string | { [tabKey: string]: string | null } | null;
  callApiOnPageSelect: boolean; // Possible to be removed since api will be called upon page load.....
  requiresValidation: boolean;
}

export const layoutConfigurations: { [key: string]: ILayoutConfig } = {
  item_01: {
    topComponent: 'Top1Component',
    userTableComponent: null,
    middleComponent: null,
    bottomComponent: 'Bottom1Component',
    callApiOnPageSelect: true,
    requiresValidation: false,
  },
  item_02: {
    topComponent: 'Top2Component',
    userTableComponent: null,
    middleComponent: 'Middle2Component',
    bottomComponent: 'Bottom1Component',
    callApiOnPageSelect: true,
    requiresValidation: false,
  },
  item_03: {
    topComponent: 'Top2Component',
    userTableComponent: null,
    middleComponent: null,
    bottomComponent: 'Bottom1Component',
    callApiOnPageSelect: true,
    requiresValidation: false,
  },
  item_04: {
    topComponent: 'Top2Component',
    userTableComponent: null,
    middleComponent: 'Middle2Component',
    bottomComponent: 'Bottom1Component',
    callApiOnPageSelect: true,
    requiresValidation: false,
  },
  item_5: {
    topComponent: 'Top1Component',
    userTableComponent: null,
    middleComponent: null,
    bottomComponent: 'Bottom1Component',
    callApiOnPageSelect: true,
    requiresValidation: false,
  },
  item_07: {
    topComponent: 'Top3Component',
    userTableComponent: 'Top0Component',
    middleComponent: null,
    bottomComponent: 'Bottom2Component',
    callApiOnPageSelect: false,
    requiresValidation: false,
  },
  item_10: {
    topComponent: 'Top3Component',
    userTableComponent: 'Top0Component',
    middleComponent: 'Middle2Component',
    bottomComponent: {
      tab1: 'Bottom1Component',
      tab2: 'Bottom2Component',
    },
    callApiOnPageSelect: false,
    requiresValidation: true,
  },
};
