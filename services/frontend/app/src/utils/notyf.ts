import { Notyf, NotyfOptions } from 'notyf';
import 'notyf/notyf.min.css';
import { ToastActionType} from "../types/toast.js";
import  '../../style.css'

// pour les amities et validation / echec venant du back
// gestion erreur inline avec html/tailwindcss

export const notyfGlobal = new Notyf({
  duration: 5000,
  position: {
    x: 'right',
    y: 'top'
  },
  dismissible: true,
  types: [
    { type: ToastActionType.SUCCESS_ACTION, className: 'notyf_success' },
    { type: ToastActionType.ERROR_ACTION, className: 'notyf_error' },
    { type: ToastActionType.INFO_ACTION, className: 'notyf_info' },
  ]
} as NotyfOptions);

// Notyf Friends TODO