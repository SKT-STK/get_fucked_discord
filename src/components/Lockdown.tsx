interface LockdownProps {
  show: boolean
}

const Lockdown = ({ show }: LockdownProps) => {
  return (<>{ show &&
    <section className='fixed inset-0 z-[100] cursor-not-allowed' />
  }</>)
}
export default Lockdown
