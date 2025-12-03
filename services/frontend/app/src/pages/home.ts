let user = {
    username: 'acancel',
    avatar: '/images/acancel.jpg'
}

export const HomePage = (): string => /*html*/ `
<div class="flex h-[85vh] w-full justify-around gap-4 p-4">
    <aside class=" bg-green-200/30 p-4 flex flex-col w-1/6 items-center justify-between border-4 border-gray-400">
        <div class="flex flex-col items-center gap-4">
            <img src=${user.avatar} alt="User's avatar" class=" w-3/4 aspect-square object-cover flex-shrink-0 border-4 border-gray-400 shadow-xl">
            <h1 class="text-center text-3xl">${user.username}</h1>
        </div>
            <button id="settings_btn" class=".bg-gray-300 p-3 size-fit self-center rounded-xl border-2 border-gray-400 hover:bg-gray-400 shadow-xl" type="button">Settings</button>
    </aside>
    <main class="flex-1 flex items-center justify-center">
        <section class="bg-gray-100 p-4 w-[40%] h-fit">
            <h1 class="text-center text-2xl">Play</h1>
            <div class="grid grid-cols-[1fr_0.1fr_1fr] grid-rows-3 gap-4">
                <span class="col-span-3"></span>
                <a href="#game" class="col-start-1 col-end-2">
                    <h2 class="text-xl hover:text-white bg-gray-300 p-2 rounded-md border border-gray-400 hover:bg-gray-400 text-center shadow-xl">Remote</h2>
                </a>
                <a href="#game" class="col-start-3">
                    <h2 class=" text-xl hover:text-white bg-gray-300 p-2 rounded-md border border-gray-400 hover:bg-gray-400 text-center shadow-xl">Tournament</h2>
                </a>
                <form id="lobby_code_form" class="col-span-3 flex items-center gap-2">
						<input id="lobby_code" type="text" name="lobby_code" class="border border-gray-400 rounded-sm p-1" required placeholder="Lobby Code">
                        <button type="submit" class="bg-gray-300 p-1 size-fit rounded-xl border-1 border-gray-400 hover:bg-gray-400 shadow-xl text-sm">Join Lobby</button>
                </form>
            </div>
        </section>
    </main>
    <section class="flex flex-col gap-4 w-1/5 bg-gray-200 p-4 border-4 border-gray-400 justify-between">
        <div class="bg-gray-300 flex flex-col p-4 rounded-md border border-gray-400 shadow-xl">
        <form id="search_form" class="flex flex-col items-center gap-2">
            <label for="search_user">Search User</label>
            <input id="search_user" type="text" name="search_user" class="border border-gray-400 rounded-sm w-full" required>
            <button id="search_btn" class=".bg-gray-300 p-2 size-fit rounded-xl border-2 border-gray-400 hover:bg-gray-400 shadow-xl" type="submit">Search</button>
        </form>
        </div>
        <div class="bg-gray-300 flex flex-col p-4 rounded-md border border-gray-400 shadow-xl h-[15%]">
            <span class="text-center text-2xl">Friend's Requests</span>
            <ul class="text-center">
                <li>No new requests</li>
            </ul>
        </div>
        <div class="bg-gray-300 flex flex-col p-4 rounded-md border border-gray-400 shadow-xl h-[30%]">
            <span class="text-center text-2xl">Friends</span>
            <ul class="text-center">
                <li>...</li>
            </ul>
        </div>
        <!-- <a href="#friends" class="bg-gray-300 mx-3 px-3 rounded-md border border-gray-400  hover:bg-gray-400 shadow-xl">
            <button>
                <h2 class="text-blue-700">Friends</h2>
            </button>
        </a>
        <a href="#requests" class="bg-gray-300 mx-2 px-2 rounded-md border border-gray-400  hover:bg-gray-400 shadow-xl">
            <button>
                <h2 class="text-blue-700">Requests</h2>
            </button>
        </a> -->
    </section>
</div>

`
