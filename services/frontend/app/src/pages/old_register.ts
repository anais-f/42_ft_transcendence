export const RegisterPage = (): string => /*html*/ `
  <div class=" text-pink-200 text-xl text-center">
      Create account
  </div>
  <form id="register-form">
    <div class="text-pink-200 text-sm text-left pt-10">
      <label>
        Username
        <input id="reg-username" name="username" required minlength="4" maxlength="16" pattern="[A-Za-z0-9_-]{4,16}" class="rounded-lg">
      </label>
    </div>
    <div class="m-1 text-pink-200 text-sm text-left">
      <label>
        Password
        <input id="reg-password" name="password" type="password" required minlength="8" maxlength="128" class="rounded-lg" >
      </label>
    </div>
    <div>
      <button class="m-5 p-0.5  bg-cyan-400 shadow-cyan-500/50 text-black ring-4 rounded-2xl"> Register </button>
          </div>
    </form>
      <p id="register-msg"></p>
    `
