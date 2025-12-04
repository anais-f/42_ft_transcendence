const user = {
	username: 'Acancel',
	avatar: '/assets/images/acancel.jpg'
}

const fr1 = {
	username: 'Anfichet',
	avatar: '/assets/images/anfichet.jpeg',
	alt: 'Nanou_avatar',
	status: 'Online'
}

const fr2 = {
	username: 'Mjuffard',
	avatar: '/assets/images/mjuffard.jpg',
	alt: 'Mich_avatar',
	status: 'Online'
}

const fr3 = {
	username: 'Lrio',
	avatar: '/assets/images/lrio.jpg',
	alt: 'Lohhiiccc_avatar',
	status: 'Offline'
}

export const HomePage = (): string => /*html*/ `
<div class="grid grid-cols-4 gap-11">
	<div class="col-span-1 flex flex-col items-start">
		<h1 class="text-2xl py-4">PROFILE</h1>
		<img src=${fr3.avatar} alt="User's avatar" class="w-full object-cover border-2 border-black grayscale-[75%]">
		<div class="flex flex-row justify-between w-full my-2">
			<h1 class="text-xl">${fr1.username}</h1>
			<h1 class="text-lg">27 yo</h1>
		</div>
		<div class="news_paragraph">
			<h1 class="text-lg py-2">Title</h1>
			<p class="text-sm pb-2">Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia. Nam perferendis facilis asperiores ea qui voluptates dolor eveniet. Omnis voluptas et ut est porro soluta ut est. Voluptatem dolore vero in. A aut iste et unde autem ut deserunt quam. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt.</p>
		</div>
		<button id="settings_btn" type="button" class="generic_btn my-2">Settings</button>
		<button id="logout_btn" type="button" class="generic_btn">Logout</button>
	</div>
	<div class="col-span-1">
		<div class="news_paragraph pt-4">
			<h1 class="text-lg py-2">Title</h1>
			<p class="text-sm pb-2">Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia. Nam perferendis facilis asperiores ea qui voluptates dolor eveniet. Omnis voluptas et ut est porro soluta ut est. Voluptatem dolore vero in. A aut iste et unde autem ut deserunt quam. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt.</p>
		</div>
		<h1 class="text-2xl py-4">ARE YOU READY ?</h1>
		<button id="remote_btn" type="button" class="generic_btn my-2">Remote</button>
		<button id="tournament_btn" type="button" class="generic_btn">Tournament</button>
		<div class="news_paragraph">
			<h1 class="text-lg py-2">Title</h1>
			<p class="text-sm pb-2">Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia. Assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia assumenda reprehenderit nesciunt. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia assumenda reprehenderit nesciunt.</p>
		</div>
	</div>
	<div class="col-span-1">
		 <div class="news_paragraph pt-8">
			<p class="text-sm pb-2">Assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui.</p>
		</div>
		<h1 class="text-2xl py-2">FEELING LONELY ?</h1>
		<p class="text-lg">You can join a game by enter the lobby code below</p>
		<form id="join_lobby_form" class="flex flex-col gap-2">
			 <input id="join_lobby" type="text" name="join_lobby" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="ENTER LOBBY CODE HERE" required>
			 <button id="join_btn" class="generic_btn" type="submit">Join</button>
		 </form>
		<div class="news_paragraph pt-4">
			<h1 class="text-lg py-2">Title</h1>
			<p class="text-sm pb-2">The head of our team during the project development</p>
		</div>
		<img src="/assets/images/image_10.png" alt="AHHHHH !" class="w-full object-cover opacity-50 select-none">
	</div>
	<div class="col-span-1">
		 <h1 class="text-2xl pt-4 pb-1">WANTED</h1>
		 <form id="search_usr_form" class="flex flex-col gap-2">
			 <input id="search_usr" type="text" name="search_usr" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="ENTER A USERNAME TO SEARCH HERE" required>
			 <button id="search_btn" class="generic_btn" type="submit">Search</button>
		 </form>
		 <h1 class="text-2xl pt-6">RELATIONSHIP</h1>
		 <div class="w-full h-[48%] border-2 border-black py-2">
			<ul class="overflow-y-scroll">
				<li class="flex flex-row justify-start border-b-2 border-black">
					<img src=${fr1.avatar} alt=${fr1.alt} class=" w-[10%] aspect-square object-cover border-1 border-black m-4">
					<div class="m-4">
						<p>${fr1.username}</p>
						<p class="text-gray-500">${fr1.status}</p>
					</div>
				</li>
				<li class="flex flex-row justify-start border-b-2 border-black">
					<img src=${fr2.avatar} alt=${fr2.alt} class=" w-[10%] aspect-square object-cover border-1 border-black m-4">
					<div class="m-4">
						<p>${fr2.username}</p>
						<p class="text-gray-500">${fr2.status}</p>
					</div>
				</li>
				<li class="flex flex-row justify-start border-b-2 border-black">
					<img src=${fr3.avatar} alt=${fr3.alt} class=" w-[10%] aspect-square object-cover border-1 border-black m-4">
					<div class="m-4">
						<p>${fr3.username}</p>
						<p class="text-gray-500">${fr3.status}</p>
					</div>
				</li>
				<li class="flex flex-row justify-start border-b-2 border-black">
					<img src=${fr3.avatar} alt=${fr3.alt} class=" w-[10%] aspect-square object-cover border-1 border-black m-4">
					<div class="m-4">
						<p>${fr3.username}</p>
						<p class="text-gray-500">${fr3.status}</p>
					</div>
				</li>
			</ul>
		 </div>
		 <h1 class="text-2xl pt-6">GET IN TOUCH</h1>
		<div class="w-full h-[20%] border-2 border-black py-2">
			<ul class="overflow-y-scroll">
				<li class="flex flex-row justify-start border-b-2 border-black">
					<img src=${fr1.avatar} alt=${fr1.alt} class=" w-[10%] aspect-square object-cover border-1 border-black m-4">
					<div class="m-4">
						<p>${fr1.username}</p>
						<div class="flex flex-row w-full justify-between gap-4">
							<button id="accept_fr_btn" type="button" class="generic_btn text-xs px-4 py-1 flex-1 w-20">Accept</button>
							<button id="decline_fr_btn" type="button" class="generic_btn text-xs px-4 py-1 flex-1 w-20">Decline</button>
						</div>
					</div>
				</li>
			</ul>
		 </div>
	</div>
</div>
`

//  <div class="flex h-[85vh] w-full justify-around gap-4 p-4">/* image 1 */


//     <aside class=" bg-green-200/30 p-4 flex flex-col w-1/6 items-center justify-between border-4 border-gray-400">
//         <div class="flex flex-col items-center gap-4">
//             <img src=${user.avatar} alt="User's avatar" class=" w-3/4 aspect-square object-cover flex-shrink-0 border-4 border-gray-400 shadow-xl">
//             <h1 class="text-center text-3xl">${user.username}</h1>
//         </div>
//             <button id="settings_btn" class=".bg-gray-300 p-3 size-fit self-center rounded-xl border-2 border-gray-400 hover:bg-gray-400 shadow-xl" type="button">Settings</button>
//     </aside>
//     <main class="flex-1 flex items-center justify-center">
//         <section class="bg-gray-100 p-4 w-[40%] h-fit">
//             <h1 class="text-center text-2xl">Play</h1>
//             <div class="grid grid-cols-[1fr_0.1fr_1fr] grid-rows-3 gap-4">
//                 <span class="col-span-3"></span>
//                 <a href="#game" class="col-start-1 col-end-2">
//                     <h2 class="text-xl hover:text-white bg-gray-300 p-2 rounded-md border border-gray-400 hover:bg-gray-400 text-center shadow-xl">Remote</h2>
//                 </a>
//                 <a href="#game" class="col-start-3">
//                     <h2 class=" text-xl hover:text-white bg-gray-300 p-2 rounded-md border border-gray-400 hover:bg-gray-400 text-center shadow-xl">Tournament</h2>
//                 </a>
//                 <form id="lobby_code_form" class="col-span-3 flex items-center gap-2">
// 						<input id="lobby_code" type="text" name="lobby_code" class="border border-gray-400 rounded-sm p-1" required placeholder="Lobby Code">
//                         <button type="submit" class="bg-gray-300 p-1 size-fit rounded-xl border-1 border-gray-400 hover:bg-gray-400 shadow-xl text-sm">Join Lobby</button>
//                 </form>
//             </div>
//         </section>
//     </main>
//     <section class="flex flex-col gap-4 w-1/5 bg-gray-200 p-4 border-4 border-gray-400 justify-between">
//         <div class="bg-gray-300 flex flex-col p-4 rounded-md border border-gray-400 shadow-xl">
//         <form id="search_form" class="flex flex-col items-center gap-2">
//             <label for="search_user">Search User</label>
//             <input id="search_user" type="text" name="search_user" class="border border-gray-400 rounded-sm w-full" required>
//             <button id="search_btn" class=".bg-gray-300 p-2 size-fit rounded-xl border-2 border-gray-400 hover:bg-gray-400 shadow-xl" type="submit">Search</button>
//         </form>
//         </div>
//         <div class="bg-gray-300 flex flex-col p-4 rounded-md border border-gray-400 shadow-xl h-[15%]">
//             <span class="text-center text-2xl">Friend's Requests</span>
//             <ul class="text-center">
//                 <li>No new requests</li>
//             </ul>
//         </div>
//         <div class="bg-gray-300 flex flex-col p-4 rounded-md border border-gray-400 shadow-xl h-[30%]">
//             <span class="text-center text-2xl">Friends</span>
//             <ul class="text-center">
//                 <li>...</li>
//             </ul>
//         </div>
//          <a href="#friends" class="bg-gray-300 mx-3 px-3 rounded-md border border-gray-400  hover:bg-gray-400 shadow-xl">
//             <button>
//                 <h2 class="text-blue-700">Friends</h2>
//             </button>
//         </a>
//         <a href="#requests" class="bg-gray-300 mx-2 px-2 rounded-md border border-gray-400  hover:bg-gray-400 shadow-xl">
//             <button>
//                 <h2 class="text-blue-700">Requests</h2>
//             </button>
//         </a>
//     </section>
// </div>


