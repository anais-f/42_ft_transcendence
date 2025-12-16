import { Button } from '../components/Button.js'
import { Input } from '../components/Input.js'
import { LoremSection } from '../components/LoremIpsum.js'

export const TestPage = (): string => {
	return /*html*/ `
  <section class="grid grid-cols-4 gap-10 h-full w-full">

    <div class="flex flex-col items-start">
      <h1 class="title_bloc">SUBSCRIBE TO OUR NEWSPAPER</h1>
      <form id="subscribe_form" data_form="subscribe" class="form_style">
          ${Input({
						id: 'subscribe_login',
						name: 'subscribe_login',
						placeholder: 'Login',
						type: 'text',
						required: true
					})}
          ${Input({
						id: 'subscribe_password',
						name: 'subscribe_password',
						placeholder: 'Password',
						type: 'password',
						required: true
					})}
          ${Input({
						id: 'subscribe_conf_password',
						name: 'subscribe_conf_password',
						placeholder: 'Confirm password',
						type: 'password',
						required: true
					})}
          ${Button({
						text: 'Subscribe',
						id: 'subscribe_btn',
						type: 'submit'
					})}
      </form>    
      
      ${LoremSection({
				title: 'Newsletter',
				variant: 'long'
			})}
    </div>
    
     <div class="flex flex-col items-start">
      ${LoremSection({
				variant: 'short'
			})}
      <img src="/assets/images/mammoth.png" alt="mamouth" class="img_style">
      ${LoremSection({
				title: 'Mamamoth',
				variant: 'medium'
			})}
     </div>
    
     <div class="flex flex-col items-start">
      ${LoremSection({
				variant: 'short'
			})}
      <h1 class="title_bloc mt-4">RESUME READING</h1>
      <!-- Login Form -->
      <form id="login_form" data_form="login" class="form_style">
          ${Input({
						id: 'login_login',
						name: 'login_login',
						placeholder: 'Login',
						type: 'text',
						required: true
					})}
          ${Input({
						id: 'login_password',
						name: 'login_password',
						placeholder: 'Password',
						type: 'password',
						required: true
					})}
          ${Button({
						text: 'Login',
						id: 'login_btn',
						type: 'submit'
					})}
      </form>
      
      <!-- 2FA Form -->
      <form id="2fa_form" data_form="2fa" class="form_style hidden">
          ${Input({
						id: '2fa_code',
						name: '2fa_code',
						placeholder: '000000',
						type: 'text',
						required: true,
						maxLength: 6,
						pattern: '[0-9]{6}',
						autoComplete: 'one-time-code',
						inputmode: 'numeric',
						additionalClasses:
							'tracking-widest text-center letter-spacing-widest'
					})}
          ${Button({
						id: '2fa_btn',
						text: 'Validate',
						type: 'submit'
					})}
      </form>
         
      ${LoremSection({
				title: 'Introduction',
				variant: 'long'
			})}    
     </div>
    
     <div class="flex flex-col items-start">
      ${LoremSection({
				title: 'New Partener',
				variant: 'short'
			})}
      <div id="google_btn" class="my-8 h-12 w-full flex justify-center"></div>
      <img src="/assets/images/screamer_girl.png" alt="screamer girl" class="img_style">
      ${LoremSection({
				variant: 'medium'
			})}
     </div>
    
  </section>
`
}
