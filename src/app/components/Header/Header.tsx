'use client';
import Styles from './styles.module.scss';
import Image from 'next/image'

export default function Header() {

    return (
        <div className={Styles.headerContainer}>
            <div className={Styles.faixa}></div>            
        </div>
    )
}