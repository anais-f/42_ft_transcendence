export const LobbyPage = (): string => /*html*/ `
<div class="flex flex-col items-center justify-start h-[85vh] w-full p-4">
      <h1>Lobby number : ${lobby_number}</h1>
      <h2 class="mt-4 mb-20">Share this code to invite other player to join...</h2>
      <div class="grid grid-cols-[1fr_0.5fr_1fr] grid-rows-3 gap-4 mt-4 w-full h-[40%]">
        <span class="col-span-3 text-center">Players:</span>
        <div class="col-start-1 col-end-2 row-start-2 row-span-2 bg-gray-200 p-4 rounded-md border border-gray-400 shadow-xl">
          <h2 class="text-center">Player 1</h2>
          <div class="flex flex-col items-center mt-4">
            <img src=${p1.avatar} alt="Player 1 Avatar" class="rounded-full w-1/3 aspect-square object-cover flex-shrink-0 border-4 border-gray-400 shadow-xl">
            <h2 class="text-center my-2">${p1.username}</h2>
          </div>
        </div>
        <div class="col-start-3 row-start-2 row-span-2 bg-gray-200 p-4 rounded-md border border-gray-400 shadow-xl">
          <h2 class="text-center">Player 2</h2>
                <div class="flex flex-col items-center mt-4">
            <img src=${p2.avatar} alt="Player 1 Avatar" class="rounded-full w-1/3 aspect-square object-cover flex-shrink-0 border-4 border-gray-400 shadow-xl">
            <h2 class="text-center my-2">${p2.username}</h2>
          </div>
        </div>

        </div>
      </div>
</div>
  `

let lobby_number = "XXXX-XXXX";

let p1 = {
  username: "Anfichet",
  avatar: "/images/anfichet.jpeg"
};

let p2 = {
  username: "Lrio",
  avatar: "/images/lrio.jpg"
};