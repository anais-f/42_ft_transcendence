export const MyPage = (): string => /*html*/ `
<body class="flex flex-row">
    <aside class=" bg-gray-200 flex flex-col w-[30%] justify-between">
        <img src="/images/acancel.jpg" alt="User's avatar" class="rounded-full justify-center size-fit">
        <table class="border-black border mt-10 mb-10">
            <tr class=" border border-black">
                <td class ="">Username :</td>
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
        <a href="Settings" class=" bg-gray-300 p-3 size-fit self-center rounded-xl hover:bg-gray-400">
            <button class="text-black">Settings</button>
        </a>
    </aside>
    <span class="flex flex-col place-items-center">
        <section class="flex flex-col items-center bg-gray-100 p-2 size-fit">
            <h1 class="text-blue-800 text-2xl">Game</h1>
            <a href="#localGame">
                <h2 class="text-blue-700 text-xl text-left">• Local</h2>
            </a>
            <a href="#remoteGame" class="align-self-start">
                <h2 class="text-blue-700 text-xl text-left">• Remote</h2>
            </a>
            <a href="#tournamentGame" class="align-self-start">
                <h2 class="text-blue-700 text-xl text-left">• Tournament</h2>
            </a>
        </section>
    </span>
    <section class="flex flex-col items-end gap-1">
      <a href="#Friends" class="bg-gray-400 mx-2 px-2 rounded-md">
        <button>
            <h2 class="text-blue-700">Friends</h2>
        </button>
      </a>
      <a href="#Request" class="bg-gray-400 mx-2 px-2 rounded-md">
        <button>
            <h2 class="text-blue-700">Request</h2>
        </button>
      </a>
    </section>
</body>
<footer class="border-t border-gray-800 text-center text-s text-gray-400 my-24 py-8">
	© 2025 ft_Transcendence — All rights reserved
</footer>
`
