export const GamePage = (): string => /*html*/ `
<div class="min-h-[80vh] w-full flex items-center justify-center">

	<div class="grid grid-cols-[0.8fr_1fr_1fr_0.8fr] gap-12 py-4 flex-auto">
		<div class="col-span-1">
				<h1 class="text-2xl text-center underline">${p1.username}</h1>
				<h1 class="text-4xl py-8 text-center">${p1.score}</h1>
				<img src="${p1.avatar}" alt="Player_1" class="w-[80%] object-cover aspect-square object-center select-none mx-auto border-solid border-2 border-black">
		</div>

		<div class="col-span-2 text-center flex-1 my-auto">
			<canvas
			id="pong"
			width="950"
			height="550"
			style="background: transparent; border: solid 4px black; display: block; margin: auto">
			</canvas>
		</div>

		<div class="col-span-1">
				<h1 class="text-2xl text-center underline">${p2.username}</h1>
				<h1 class="text-4xl py-8 text-center">${p2.score}</h1>
				<img src="${p2.avatar}" alt="Player_2" class="w-[80%] object-cover aspect-square object-center select-none mx-auto border-solid border-2 border-black">
		</div>

	</div>
</div>
`
let p1 = {
	username: 'PlayerOne',
	avatar: '/assets/images/rhino.png',
	score: 2
}

let p2 = {
	username: 'PlayerTwo',
	avatar: '/assets/images/bear.png',
	score: 1
}
