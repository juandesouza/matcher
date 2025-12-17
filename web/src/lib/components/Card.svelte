<script>
	/**
	 * @typedef {Object} CardProps
	 * @property {string} [class=''] - Additional CSS classes
	 */
	
	export let className = '';
</script>

<div class={`card p-6 ${className}`} {...$$restProps}>
	<slot />
</div>

