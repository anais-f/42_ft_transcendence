# Components Documentation

## Button

Reusable button component with consistent styling.

### Props

```typescript
interface ButtonProps {
	text: string // Button text
	id?: string // HTML ID attribute
	type?: 'submit' | 'button' | 'reset' // Button type (default: 'button')
	additionalClasses?: string // Additional CSS classes
}
```

### Usage Example

```typescript
${Button({
  text: 'Subscribe',
  id: 'register_btn',
  type: 'submit'
})}
```

---

## Input

Input field component with validation and support for various types.

### Props

```typescript
interface InputProps {
	id: string // HTML ID attribute
	name: string // Input name attribute
	placeholder?: string // Placeholder text
	type?: string // Input type (text, password, email, etc.)
	required?: boolean // Required field
	maxLength?: number // Maximum length
	pattern?: string // Validation regex pattern
	autoComplete?: string // Autocomplete value
	inputmode?: string // Mobile keyboard mode
	additionalClasses?: string // Additional CSS classes
}
```

### Usage Examples

```typescript
${Input({
  id: 'login_login',
  name: 'login_login',
  placeholder: 'Login',
  type: 'text',
  required: true
})}

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
  additionalClasses: 'tracking-widest text-center'
})}
```

---

## LoremSection

Lorem Ipsum placeholder text component with control over line count and automatic space filling.

### Props

```typescript
interface LoremIpsumProps {
	title?: string // Optional section title
	variant?: 'xs' | 'short' | 'medium' | 'long' | 'xl' | `fill` // Text size
	additionalClasses?: string // Additional CSS classes
}
```

### Variants

- `xs`: 2 lines
- `short`: 4 lines
- `medium`: 8 lines (default)
- `long`: 12 lines
- `xl`: 20 lines
- `fill`: fills available space up to the end of the container

### Behavior

The component automatically adapts to fill available space in flex containers while respecting the maximum line count defined by the variant. Text can display up to the variant's line count and automatically shrinks on resize to keep other elements visible.

### Usage Examples

#### Basic placeholder text (4 lines)

```typescript
${LoremSection({
  variant: 'short'
})}
```

#### With title and medium size (8 lines)

```typescript
${LoremSection({
  title: 'Mamamoth',
  variant: 'medium'
})}
```

#### Large content with automatic fill

```typescript
${LoremSection({
  title: 'Newsletter',
  variant: 'fill'  // Takes available space up to 20 lines
})}
```

#### With additional classes

```typescript
${LoremSection({
  title: 'New Partner',
  variant: 'short',
  additionalClasses: 'mb-4'
})}
```

### Common Use Cases

**Typical column structure:**

```typescript
<div class="flex flex-col items-start min-h-0">
  ${LoremSection({
    variant: 'short'  // Short text at the top
  })}

  <img src="/path/to/image.png" alt="image" class="img_style">

  ${LoremSection({
    title: 'Section Title',
    variant: 'fill'  // Automatically fills remaining space at the bottom
  })}
</div>
```

**Column alignment:**

Variants allow precise control over placeholder text height to visually align elements between columns in full page view.

**Responsiveness:**

The component automatically ensures buttons and forms remain visible when resizing the window by adapting the text content to the available space.

---

## Styling Notes

- All components use Tailwind CSS
- Components return HTML strings (template literals)
- The `.news_paragraph` style automatically applies opacity and disables text selection on Lorem Ipsum text
