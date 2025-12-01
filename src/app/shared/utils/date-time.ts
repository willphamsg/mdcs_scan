// export const MONTH_FORMATS = {
//   parse: {
//     dateInput: { year: 'numeric', month: '2-digit' }, // not used heavily but provided
//   },
//   display: {
//     dateInput: 'MM/yyyy',
//     monthYearLabel: 'MMM yyyy',
//     dateA11yLabel: 'LL',
//     monthYearA11yLabel: 'MMMM yyyy',
//   },
// };

export const MONTH_FORMATS = {
  parse: {
    dateInput: { month: '2-digit', year: 'numeric' },
  },
  display: {
    // dateInput: { month: '2-digit', year: 'numeric' },
    dateInput: { month: 'long', year: 'numeric' },
    monthYearLabel: { month: 'short', year: 'numeric' },
    dateA11yLabel: { month: 'long', year: 'numeric' },
    monthYearA11yLabel: { month: 'long', year: 'numeric' },
  },
};
