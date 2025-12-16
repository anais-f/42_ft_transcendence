// TODO : components for buttons and inputs
// TODO : component lorem ipsum
// TODO : refactor HTML and CSS

export const TournamentPage = (): string => {
	return /*html*/ `
  <section class="h-screen">
    <h1>Tournament Page</h1>
    <section class="grid grid-cols-[1fr_3fr] gap-10 h-full">
      <div class="col-span-1 flex flex-col items-center w-full min-w-0">
        <div class="pt-10 pb-5 w-full">
          <h1 class="text-2xl text-center w-full flex flex-wrap justify-center items-center gap-2">
            <span class="select-none truncate">TOURNAMENT CODE:</span>
            <span class="whitespace-nowrap">T-XXXXX</span>
          </h1>
        </div>
        <div class="flex flex-col items-center w-full pb-5">
          <button id="btn-copy" class="generic_btn mb-2 truncate">
            Copy Lobby Code
          </button>
        </div>

      </div>
      <div class="flex flex-col gap-10">
        <div class="grid grid-cols-4 gap-10">
          <div class="flex flex-col items-center justify-center">
            <p class="truncate w-full text-center">Player 1</p>
            <img src="/avatars/img_default.png" alt="Player 1" class="w-32 h-32 object-cover">
          </div>
          <div class="flex flex-col items-center justify-center">
            <p class="truncate w-full text-center">Player 2</p>
            <img src="/avatars/img_default.png" alt="Player 2" class="w-32 h-32 object-cover">
          </div>
          <div class="flex flex-col items-center justify-center">
            <p class="truncate w-full text-center">Player 3</p>
            <img src="/avatars/img_default.png" alt="Player 3" class="w-32 h-32 object-cover">
          </div>
          <div class="flex flex-col items-center justify-center">
            <p class="truncate w-full text-center">Player 4</p>
            <img src="/avatars/img_default.png" alt="Player 4" class="w-32 h-32 object-cover">
          </div>
        </div>
        <div class="flex-1"> 
          <div class="grid grid-cols-3 grid-rows-9">
            <div class="border-b-2 tournament-cell">
              <span class="truncate">PLAYER 1</span>
              <span>10</span>
            </div>
            <div></div>
            <div></div>
            <div class="border-r-2 tournament-cell"></div>
            <div class="border-b-2 tournament-cell">
              <span class="truncate">PLAYER 1</span>
              <span>10</span>
            </div>
            <div></div>
            <div class="border-r-2 border-b-2 tournament-cell">
              <span class="truncate">PLAYER 3</span>
              <span>2</span>
            </div>
            <div class="border-r-2 tournament-cell"></div> 
            <div></div>
            <div></div>
            <div class="border-r-2 tournament-cell"></div>
            <div></div>
            <div></div>
            <div class="border-r-2 tournament-cell"></div>
            <div class="border-b-2 tournament-cell truncate">PLAYER 1</div>
            <div></div>
            <div class="border-r-2 tournament-cell"></div>
            <div></div>
            <div class="border-b-2 tournament-cell">
              <span class="truncate">PLAYER 2</span>
              <span>7</span>
            </div>
            <div class="border-r-2 tournament-cell"></div>
            <div></div>
            <div class="border-r-2 tournament-cell"></div>
            <div class="border-b-2 border-r-2 tournament-cell">
              <span class="truncate">PLAYER 4</span>
              <span>6</span>
            </div>
            <div></div>
            <div class="border-b-2 border-r-2 tournament-cell">
              <span class="truncate">PLAYER 4</span>
              <span>10</span>
            </div>
          </div>
        </div>  
      </div>
    </section>
  </section>
`
}
