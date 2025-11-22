// import '../style.css'
// // import { createButton, createLink, createImage } from "./components/componentsUtils.js";
// import { showPopup } from './components/popUp.js';

// const root: HTMLElement = document.getElementById('content') ?? document.body

// const imgLink: HTMLImageElement = createImage ({
//         src: '/images/lrio.jpg',
//         alt: 'LRIO',
//         className: 'rounded',
//     })

// const link: HTMLAnchorElement = createLink({
//     href: '#home',
//     title: 'HOME_SWEET_HOME',
//     className: 'text-blue-600 hover:text-red-500 text-center',
//     onClick: ((ev: MouseEvent) => {console.log('click')}),
//     img: imgLink as HTMLImageElement
// })

// const button: HTMLButtonElement = createButton({
//     name: 'REGISTER',
//     type: 'button',
//     className: ' bg-gray-300 p-8 self-center rounded-xl border-2 border-gray-400 hover:bg-gray-400 shadow-xl',
//     onClick: ((ev: MouseEvent) => {
//         console.log('clack')
//         const img = createImage({
//             src: '/images/lrio.jpg',
//             alt: 'LRIO'
//         })
//         showPopup(img, {
//             id: 'popup-overlay',
//             className: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50'
//         })
//     })
// })

// root.appendChild(link)
// root.appendChild(button)
