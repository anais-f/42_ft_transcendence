// TODO : components for buttons and inputs
// TODO : component lorem ipsum
// TODO : refactor HTML and CSS

export const TestPage = (): string => {
	return /*html*/ `
  <section class="grid grid-cols-4 gap-10 h-full w-full">

  <div class="bg-gray-100">
   <p> 1ere colonne </p>

  </div>

   <div class="bg-blue-100">
    <p> 2ere colonne </p>
   </div>

   <div class="bg-yellow-100">
    <p> 3ere colonne </p>
   </div>

   <div class="bg-yellow-100 col-span-1">
    <p> 4ere colonne </p>
   </div>

  </section>
`
}
