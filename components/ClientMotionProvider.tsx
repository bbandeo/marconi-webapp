'use client'

import React from 'react'
import { MotionConfig } from 'framer-motion'

interface ClientMotionProviderProps {
	children: React.ReactNode
}

export default function ClientMotionProvider({ children }: ClientMotionProviderProps) {
	return (
		<MotionConfig transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
			{children}
		</MotionConfig>
	)
}