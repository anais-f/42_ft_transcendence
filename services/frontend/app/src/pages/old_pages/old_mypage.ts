export const MyPage = (): string => /*html*/ `
<div class="flex min-h-[80vh]">
    <aside class=" bg-gray-200 flex flex-col w-1/6 items-center justify-around border-4 border-gray-400">
        <img src="/images/acancel.jpg" alt="User's avatar" class="rounded-full w-3/4 aspect-square object-cover flex-shrink-0 border-4 border-gray-400 shadow-xl">
        <table class="border-black border my-1">
            <tr class="border border-black">
                <td class =>Username</td>
                <td >Adrien</td>
            </tr>
            <tr>
                <td>Win</td>
                <td >4</td>
            </tr>
            <tr>
                <td>Lose</td>
                <td >2</td>
            </tr>
            <tr>
                <td>Last connection</td>
                <td>10/11/25</td>
            </tr>
        </table>
        <a href="#Settings" class=" bg-gray-300 p-3 size-fit self-center rounded-xl border-2 border-gray-400 hover:bg-gray-400 shadow-xl">
            <button>Settings</button>
        </a>
    </aside>
    <main class="flex-1 flex items-center justify-center">
        <section class="bg-gray-100 p-4 w-[40%] h-fit">
            <h1 class="text-center text-blue-800 text-2xl">Play</h1>
            <div class="grid grid-cols-3 grid-rows-3 gap-4">
                <span class="col-span-3"></span>
                <a href="#game" class="col-start-1 col-end-2">
                    <h2 class="text-blue-700 text-xl hover:text-cyan-700 bg-gray-300 p-2 rounded-md border border-gray-400 hover:bg-gray-400 text-center shadow-xl">Local</h2>
                </a>
                <a href="#game" class="col-start-3">
                    <h2 class="text-blue-700 text-xl hover:text-cyan-700 bg-gray-300 p-2 rounded-md border border-gray-400 hover:bg-gray-400 text-center shadow-xl">Remote</h2>
                </a>
                <a href="#game" class="col-span-3">
                    <h2 class="text-blue-700 text-xl hover:text-cyan-700 bg-gray-300 p-2 rounded-md border border-gray-400 hover:bg-gray-400 text-center shadow-xl">Tournament</h2>
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
