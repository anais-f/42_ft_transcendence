import { Notyf, NotyfOptions } from 'notyf'
import 'notyf/notyf.min.css'
import { ToastActionType } from '../types/toast.js'
import '../../style.css'

export const notyfGlobal = new Notyf({
	duration: 5000,
	position: {
		x: 'right',
		y: 'top'
	},
	dismissible: true,
	types: [
		{
			type: ToastActionType.SUCCESS_ACTION,
			className: 'notyf_success'
		},
		{
			type: ToastActionType.ERROR_ACTION,
			className: 'notyf_error'
		},
		{
			type: ToastActionType.INFO_ACTION,
			className: 'notyf_info'
		}
	]
} as NotyfOptions)

export const notyfFriends = new Notyf({
	duration: 10000,
	position: {
		x: 'left',
		y: 'top'
	},
	dismissible: true,
	types: [
		{ type: ToastActionType.FRIEND_REQUEST, className: 'notyf_friend' },
		{ type: ToastActionType.FRIEND_ACCEPT, className: 'notyf_friend' },
		{ type: ToastActionType.FRIEND_REJECT, className: 'notyf_friend' },
		{ type: ToastActionType.FRIEND_REMOVE, className: 'notyf_friend' }
	]
} as NotyfOptions)
