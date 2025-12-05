export const ProfilePage = (): string => /*html*/ `
<div class="grid grid-cols-[0.6fr_0.6fr_1fr] gap-16 p-8">
	<div class="col-span-1 flex flex-col items-start">
		<h1 class="text-2xl py-4">PLAYER OF THE MONTH</h1>
		<img src=${user.avatar} alt="User's avatar" class="w-full object-cover border-2 border-black saturate-[75%] contrast-[100%]">
		<span class="text-2xl pt-4">${user.username}</span>
		<span class="text-xl py-2">${user.status}</span>
		<span class="text-xl">${user.last_seen}</span>
		<div class="news_paragraph">
			<h1 class="text-lg py-2">Title</h1>
			<p class="text-sm pb-2">Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia. Nam perferendis facilis asperiores ea qui voluptates dolor eveniet. Omnis voluptas et ut est porro soluta ut est. Eos debitis officia. Nam perferendis facilis asperiores ea qui voluptates dolor eveniet. Omnis voluptas et ut est porro soluta ut est.</p>
		</div>
		<button id="add_friend_btn" type="button" class="generic_btn my-2">Add Friend</button>
	</div>
	<div class="col-span-1 flex flex-col items-start">
		<div class="news_paragraph pt-4">
			<p class="text-sm pb-2">Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. </p>
		</div>
		<h1 class="text-2xl py-4">STATISTICS</h1>
		<span>${stats.games_played} Games Played</span>
		<span>${stats.wins} Wins</span>
		<span>${stats.losses} Losses</span>
		<img src="/assets/images/cup.png" alt="Cup" class="select-none object-cover border-2 border-black my-8 opacity-55">
		<div class="news_paragraph">
			<h1 class="text-lg py-2">Title</h1>
			<p class="text-sm pb-2">Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia. Assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Eaque optio non quae. Vel sunt in et rem. </p>
		</div>
	</div>

	<div class="col-span-1 flex flex-col size-full justify-center items-center">
		<div class="size-[80%] border-8 my-20 border-black border-double border-separate">
			<h1 class="text-2xl py-4 text-center">GAME HISTORY</h1>
			<table class="w-full border-collapse border border-black">
				<thead>
					<tr>
						<th class="border border-black px-2">Date</th>
						<th class="border border-black px-2">Player 1</th>
						<th class="border border-black px-2">Score 1</th>
						<th class="border border-black px-2">Score 2</th>
						<th class="border border-black px-2">Player 2</th>
						<th class="border border-black px-2">Result</th>
					</tr>
				</thead>
				<tbody>
					${history.map(game => `
					<tr>
						<td class="border border-black px-2 text-center">${game.date}</td>
						<td class="border border-black px-2 text-center">${game.player1}</td>
						<td class="border border-black px-2 text-center">${game.score1}</td>
						<td class="border border-black px-2 text-center">${game.score2}</td>
						<td class="border border-black px-2 text-center">${game.player2}</td>
						<td class="border border-black px-2 text-center">${game.result}</td>
					</tr>
					`).join('')}
				</tbody>
			</table>
		</div>
	</div>
</div>
`

const user = {
	avatar: '/assets/images/avatar.png',
	username: 'Mammoth',
	status: 'Online',
	last_seen: '05/12/2025 12:32am',

}

const stats = {
	games_played: 256,
	wins: 198,
	losses: 58,
}

const history = [
	{ date: '2025-05-01', player1: 'Mammoth', score1: 21, score2: 15, player2: 'Tiger', result: 'Win' },
	{ date: '2025-05-02', player1: 'Mammoth', score1: 18, score2: 21, player2: 'Eagle', result: 'Loss' },
	{ date: '2025-05-03', player1: 'Mammoth', score1: 22, score2: 20, player2: 'Shark', result: 'Win' },
	{ date: '2025-05-04', player1: 'Mammoth', score1: 19, score2: 21, player2: 'Lion', result: 'Loss' },
	{ date: '2025-05-05', player1: 'Mammoth', score1: 23, score2: 22, player2: 'Wolf', result: 'Win' },
]