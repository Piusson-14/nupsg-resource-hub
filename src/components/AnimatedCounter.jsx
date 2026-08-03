import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function AnimatedCounter({ value, prefix = '', suffix = '' }) {
	const [displayValue, setDisplayValue] = useState(0);

	useEffect(() => {
		const frame = requestAnimationFrame(() => {
			setDisplayValue(value);
		});

		return () => cancelAnimationFrame(frame);
	}, [value]);

	return (
		<motion.span>
			{prefix}
			{displayValue}
			{suffix}
		</motion.span>
	);
}
