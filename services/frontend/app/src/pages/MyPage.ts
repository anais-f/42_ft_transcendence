export const MyPage = (): string => /*html*/ `
<div class="flex min-h-[80vh]">
    <aside class=" bg-gray-200 flex flex-col w-1/4 items-center justify-around border-4 border-gray-400">
        <img src="/images/acancel.jpg" alt="User's avatar" class="rounded-full w-3/4 aspect-square object-cover flex-shrink-0 border-4 border-gray-400 shadow-xl">
        <table class="border-black border my-1 flex-[0.5]">
            <tr class="border border-black">
                <td class =>Username :</td>
                <td class="pl-1">Adrien</td>
            </tr>
            <tr>
                <td>Win : </td>
                <td class="pl-5">4</td>
            </tr>
            <tr>
                <td>Lose : </td>
                <td class="pl-5">2</td>
            </tr>
            <tr>
                <td>Last connection : </td>
                <td class="pl-1">10/11/25</td>
            </tr>
        </table>
        <a href="Settings" class=" bg-gray-300 p-3 size-fit self-center rounded-xl border-2 border-gray-400 hover:bg-gray-400 shadow-xl">
            <button>Settings</button>
        </a>
    </aside>
    <main class="flex-1 flex items-center justify-center">
        <section class="bg-gray-100 p-4 w-[50%] h-fit">
            <h1 class="text-center text-blue-800 text-2xl">Play</h1>
            <div class="flex flex-1 my-4 justify-around flex-wrap">
                <a href="#localGame">
                    <h2 class="text-blue-700 text-xl hover:text-cyan-700 bg-gray-300 p-2 rounded-md border border-gray-400 hover:bg-gray-400 w-[120%] text-center shadow-xl">Local</h2>
                </a>
                <a href="#remoteGame">
                    <h2 class="text-blue-700 text-xl hover:text-cyan-700 bg-gray-300 p-2 rounded-md border border-gray-400 hover:bg-gray-400 w-[100%]text-center shadow-xl">Remote</h2>
                </a>
            </div>
            <div class="text-center">
                <a href="#tournamentGame">
                    <h2 class="text-blue-700 text-xl hover:text-cyan-700 bg-gray-300 p-2 rounded-md border border-gray-400 hover:bg-gray-400 min-w-[100%] text-center shadow-xl">Tournament</h2>
                </a>
            </div>
        </section>
    </main>
    <section class="flex flex-col items-end justify-end gap-1">
        <a href="#friends" class="bg-gray-300 mx-3 px-3 rounded-md border border-gray-400  hover:bg-gray-400 shadow-xl">
            <button>
                <h2 class="text-blue-700">Friends</h2>
            </button>
        </a>
        <a href="#requests" class="bg-gray-300 mx-2 px-2 rounded-md border border-gray-400  hover:bg-gray-400 shadow-xl">
            <button>
                <h2 class="text-blue-700">Requests</h2>
            </button>
        </a>
    </section>
</div>
<footer class="border-t border-gray-800 text-center text-s text-gray-400 my-4 py-4">
	© 2025 ft_Transcendence — All rights reserved
</footer>
`
