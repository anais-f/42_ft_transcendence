export const MyPage = (): string => /*html*/ `
<body class="flex ">
    <aside class=" bg-blue-800 col-start-1 col-end-2">
        <img src="/images/acancel.jpg" alt="User's avatar" class="rounded-full justify-center size-1/4">
        <table class="border-white border mt-10 mb-10">
            <tr class=" border border-white">
                <td class ="w-fit">Username :</td>
                <td class="pl-1 flex-wrap">Adrien</td>
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
        <a href="Settings" class=" bg-gray-300 p-3">
            <button class="text-black">Settings</button>
        </a>
    </aside>
    <section class="bg-white ml-10 p-10 col-start-2 col-end-3">
        <h1 class="text-blue-800 text-xl">Game</h1>
        <a href="#localGame">
            <h2 class="text-blue-700">• Local</h2>
        </a>
        <a href="#remoteGame">
            <h2 class="text-blue-700">• Remote</h2>
        </a>
        <a href="#tournamentGame">
            <h2 class="text-blue-700">• Tournament</h2>
        </a>
    </section>
    <section class="text-right">
      <a href="#Freinds" class="bg-gray-400">
        <button>
            <h2 class="text-blue-700">Friends</h2>
        </button>
      </a>
    </section>
    <section class="text-right">
      <a href="#Request" class="bg-gray-400">
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
