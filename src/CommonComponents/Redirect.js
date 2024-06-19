
// import { SetCookie, RemoveCookie } from "appuicommonutils";
// import { CApplicationIds } from "../CommonComponents/Constant";
// import { Envurl } from "../Envurl";
// const env = Envurl();
// export function Redirect(app) {
//   RemoveCookie('isRedirect');
//   SetCookie('isRedirectFromReact', true);
//   switch (app.appId) {
//     case CApplicationIds.SmartSearch: {
//       if (app.redirectToReact) {
//         window.open(`${env.reactSmartSearchUrl}`, '_self');
//       } else {
//         window.open(`${env.angularSmartSearchUrl}`, '_self');
//       }
//       break;
//     }
//     case CApplicationIds.InsightsView: {
//       if (app.redirectToReact) {
//         window.open(`${env.reactInsightsViewUrl}`, '_self');
//       } else {
//         window.open(`${env.angularInsightsViewUrl}`, '_self');
//       }
//       break;
//     }
//     case CApplicationIds.AAE: {
//       if (app.redirectToReact) {
//         window.open(`${env.reactAaeUrl}`, '_self');
//       } else {
//         window.open(`${env.angularAAEUrl}`, '_self');
//       }
//       break;
//     }
//     case CApplicationIds.Emulator: {
//       if (app.redirectToReact) {
//         window.open(`${env.reactEmulatorUrl}`, '_self');
//       } else {
//         window.open(`${env.angularEmulatorUrl}`, '_self');
//       }
//       break;
//     }
//     case CApplicationIds.Idcms: {
//       if (app.redirectToReact) {
//         window.open(`${env.reactIdcmsUrl}`, '_self');
//       } else {
//         window.open(`${env.angularIdcmsUrl}`, '_self');
//       }
//       break;
//     }
//     case CApplicationIds.MemberRewards: {
//       if (app.redirectToReact) {
//         window.open(`${env.reactMemberRewardsUrl}`, '_self');
//       } else {
//         window.open(`${env.angularMemberRewardsUrl}`, '_self');
//       }
//       break;
//     }
//     case CApplicationIds.Lerd: {
//       if (app.redirectToReact) {
//         window.open(`${env.reactLerdUrl}`, '_self');
//       } else {
//         window.open(`${env.angularLerdUrl}`, '_self');
//       }
//       break;
//     }
//     case CApplicationIds.UserAccessManagement: {
//       if (app.redirectToReact) {
//         window.open(`${env.reactUAMUrl}`, '_self');
//       } else {
//         window.open(`${env.angularUAMUrl}`, '_self');
//       }
//       break;
//     }
//     case CApplicationIds.smartAlert: {
//       window.open(`${env.smartAlertUrl}`, '_blank');
//       break;
//     }
//     case CApplicationIds.Audit: {
//       if (app.redirectToReact) {
//         window.open(`${env.reactAuditUrl}`, '_self');
//       } else {
//         window.open(`${env.angularAuditUrl}`, '_self');
//       }
//       break;
//     }
//     case CApplicationIds.ChatOverride: {
//       if (app.redirectToReact) {
//         window.open(`${env.reactChatOverrideUrl}`, '_self');
//       } else {
//         window.open(`${env.angularChatOverrideUrl}`, '_self');
//       }
//       break;
//     }
//     case CApplicationIds.Benefits: {
//       if (app.redirectToReact) {
//         window.open(`${env.reactBenefitUrl}`, '_self');
//       } else {
//         window.open(`${env.angularBenefitsUrl}`, '_self');
//       }
//       break;
//     }
//     case CApplicationIds.Empi: {
//       if (app.redirectToReact) {
//         window.open(`${env.reactEmpiUrl}`, '_self');
//       } else {
//         window.open(`${env.angularEmpiUrl}`, '_self');
//       }
//       break;
//     }
//     case CApplicationIds.THC: {
//       if (app.redirectToReact) {
//         window.open(`${env.reactFAMUrl}`, '_self');
//       } else {
//         window.open(`${env.angularTHCUrl}`, '_self');
//       }
//       break;
//     }
//     case CApplicationIds.TDM: {
//       window.open(`${env.tdmSspUrl}`, '_blank');
//       break;
//     }
//     case CApplicationIds.MAM: {
//       if (app.redirectToReact) {
//         window.open(`${env.reactMAMUrl}`, '_self');
//       }
//       break;
//     }
//     case CApplicationIds.ServiceCatalog: {
//       if (app.redirectToReact) {
//         window.open(`${env.serviceCatalogUrl}`, '_self');
//       }
//       break;
//     }
//     case CApplicationIds.PropAIR: {
//       if (app.redirectToReact) {
//         window.open(`${env.reactPropairUrl}`, '_self');
//       } 
//       break;
//     }
//     case CApplicationIds.pcinsightsreport: {
//       if (app.redirectToReact) {
//         window.open(`${env.reactpcinsightsreportUrl}`, '_self');
//       } 
//       break;
//     }
//     case CApplicationIds.Cmag: {
//       if (app.redirectToReact) {
//         window.open(`${env.reactCmagUrl}`, '_self');
//       }
//       break;
//     }
//     case CApplicationIds.DOI: {
//       if (app.redirectToReact) {
//         window.open(`${env.reactdoiUrl}`, '_self');
//       } 
//       break;
//     }

//     default:
//       break
//   }

// }