
export const LoginPage = (): string => /*html*/ `
	<section class="pt-6 h-[100%]">
		<h1 class="text-5xl font-bold text-center">Transcendence</h1>
		<div id="img-home">
			<img src="/images/pong.avif" alt="ping" class="flex-shrink-0 p-10">
		</div>
		<div id="btn-home" class="grid grid-cols-[1fr_0.1fr_1fr] grid-rows-2 p-4 gap-5 size-fit mx-auto">
			<button id="btn-signup" class="generic_btn col-start-1 col-end-2 p-2">Sign up</button>
			<button id="btn-signin" class="generic_btn col-start-3 col-end-4 p-2">Sign in</button>
			<button id="btn-google" class="generic_btn col-span-3 p-2 px-4 flex justify-center">
				<img src="/images/l-ggl.webp" alt="Google_logo" class="size-7 inline -ml-3">
				Continue with Google
			</button>
		</div>
	</section>
`



// <div class="min-h-[80vh]">
//     <h1 class="text-8xl text-center text-orange-400 bg-[url(/images/pong.avif)] bg-no-repeat bg-center py-48">
//       ft_transcendence</h1>
//     <div class="flex place-content-center">
//       <a href="#register">
//         <button class="bg-gray-300 m-5 p-3 rounded-md border border-gray-400  hover:bg-gray-400 shadow-xl">Sign in</button>
//       </a>
//       <a href="#wales">
//         <button class="bg-gray-300 m-5 p-3 rounded-md border border-gray-400  hover:bg-gray-400 shadow-xl">Sign up</button>
//       </a>
//         <a href="#me" class="flex justify-between">
//           <button class="bg-gray-100 place-center m-5 rounded-lg p-3 px-4 hover:bg-gray-400 shadow-xl">
//             <img src="/images/Google_logo_svg.webp" alt="Google_logo" class="size-7 inline -ml-3">
//             Continue with Google</button>
//         </a>
//     </div>
// </div>