export const SettingsPage = (): string => /*html*/ `
<section class="grid grid-cols-4 gap-11">
	<div class="col-span-1 flex flex-col items-start">
		<h1 class="text-2xl py-4">WOULD LIKE TO ...</h1>
		<div class="news_paragraph">
			<h1 class="text-lg pt-4">Title</h1>
			<p class="text-sm py-2">Ipsum dolore veritatis odio in a. Asesciunt. Voluptates dolores doloremque. Beatae quii aliquam qui commodi. Eveniet possimus voluptas voluptatem.</p>
		</div>
		<h1 class="text-2xl py-4">CHANGE USERNAME ?</h1>
		<form id="change_username_form" class="flex flex-col gap-2 w-full">
			<input id="change_username" type="text" name="change_username" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="USERNAME" required>
			<button id="change_username_btn" class="generic_btn mt-4" type="submit">Save it</button>
		</form>
		<div class="news_paragraph">
			<h1 class="text-lg pt-4">Title</h1>
			<p class="text-sm py-2">Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia. Assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi.  Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi.  Consectetur minus maiores qui.  Assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Eaque optio non quae.</p>
		</div>
	</div>
	
	<div class="col-span-1 flex flex-col items-start">
		<div class="news_paragraph">
			<p class="text-sm py-6">Ipsum dolore veritatis odio in ipsa corrupti aliqu
		</div>
		<img src="/assets/images/paddle.png" alt="paddle" class="w-full object-cover opacity-50 select-none">
		<h1 class="text-2xl pt-8 pb-1">CHANGE PASSWORD ?</h1>
		<form id="change_password_form" class="flex flex-col gap-2 w-full">
			<input id="change_password" type="password" name="change_password" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="NEW PASSWORD" required>
			<input id="change_password_confirm" type="password" name="change_password_confirm" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="CONFIRM NEW PASSWORD" required>
			<input id="change_password_2fa" type="text" name="change_password_2fa" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="2FA CODE" required>
			<button id="change_password_btn" class="generic_btn mt-4" type="submit">Save it</button>
		</form>
		
	</div>

	<div class="col-span-1 flex flex-col items-start">
		<div class="news_paragraph">
			<p class="text-sm pt-6 pb-2">Ipsum doloores qui. Eos debitis officia. Aui et placeat. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat.</p>
		</div>
		<h1 class="text-2xl pt-4 pb-1">CHANGE AVATAR ?</h1>
		<form id="change_avatar_form" class="flex flex-col gap-2">
			<input id="change_avatar" type="file" name="change_avatar" class="p-12 border-2 border-dashed text-center border-black bg-inherit w-full font-[Birthstone]" placeholder="AVATAR" required>
			<button id="change_avatar_btn" class="generic_btn mt-4" type="submit">Save it</button>
		</form>
		<div class="news_paragraph">
			<h1 class="text-lg pt-4">Title</h1>
			<p class="text-sm py-2">Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia. Assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui.  Assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Eaque optio non quae. Vel sunt in et rem. Quidem qui autem assumenda reprehenderit nesciunt. Voluptates dolores doloremque. Beatae qui et placeat. Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi.</p>
		</div>
	</div>

	<div class="col-span-1 flex flex-col items-start">
		<div id="disable_2fa" class="w-full">
			<h1 class="text-2xl pt-8 pb-1">DISABLE 2FA ?</h1>
			<form id="disable_2fa_form" class="flex flex-col gap-2 w-full">
				<input id="disable_2fa_code" type="text" name="disable_2fa_code" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="2FA CODE" required>
				<input id="disable_2fa_code_password" type="password" name="disable_2fa_code_password" class=" px-2 border-b-2 text-xl border-black bg-inherit w-full font-[Birthstone]" placeholder="PASSWORD" required>
				<button id="disable_2fa_btn" class="generic_btn mt-4" type="submit">Disable 2FA</button>
			</form>
		</div>
		<img src="/assets/images/tiger.png" alt="tiger" class="w-full object-cover opacity-50 select-none">
		<div class="news_paragraph">
			<h1 class="text-lg pt-6">Title</h1>
			<p class="text-sm py-2">Ipsum dolore veritatis odio in ipsa corrupti aliquam qui commodi. Eveniet possimus voluptas voluptatem. Consectetur minus maiores qui. Eos debitis officia. Nam perferendis facilis asperiores ea qui voluptates dolor eveniet. Omnis voluptas et ut est porro soluta ut est.</p>
		</div>
	</div>
</section>
`
