<script>
	/**
	 * @typedef {Object} ButtonProps
	 * @property {'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'} [variant='primary'] - Button variant
	 * @property {'sm' | 'md' | 'lg'} [size='md'] - Button size
	 * @property {boolean} [disabled=false] - Whether button is disabled
	 * @property {'button' | 'submit' | 'reset'} [type='button'] - Button type
	 * @property {string} [class=''] - Additional CSS classes
	 */
	
	/** @type {'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'} */
	export let variant = 'primary';
	
	/** @type {'sm' | 'md' | 'lg'} */
	export let size = 'md';
	
	export let disabled = false;
	
	/** @type {'button' | 'submit' | 'reset'} */
	export let type = 'button';
	
	export let className = '';
	
	/** @type {Record<'primary' | 'secondary' | 'danger' | 'ghost' | 'outline', string>} */
	const variantClasses = {
		primary: 'bg-gray-800 hover:bg-gray-700 text-white shadow-md hover:shadow-lg border-2 border-white',
		secondary: 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600',
		danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg border border-red-700',
		ghost: 'bg-transparent hover:bg-gray-800 text-text-light border border-transparent',
		outline: 'bg-transparent border-2 border-gray-600 hover:bg-gray-800 text-text-light hover:border-gray-500'
	};
	
	/** @type {Record<'sm' | 'md' | 'lg', string>} */
	const sizeClasses = {
		sm: 'h-9 px-4 text-sm',
		md: 'h-11 px-8 text-base',
		lg: 'h-12 px-10 text-lg'
	};
	
	$: buttonClass = `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-crimson-pulse disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
</script>

<button
	type={type}
	disabled={disabled}
	class={buttonClass}
	{...$$restProps}
>
	<slot />
</button>

