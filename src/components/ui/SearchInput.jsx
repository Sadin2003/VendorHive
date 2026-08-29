import Icon from './Icon'

export default function SearchInput({ value, onChange, placeholder = 'Search…', ...rest }) {
  return (
    <div className="input-icon-wrap" style={{ flex: 1 }}>
      <Icon name="i-search" size={17} />
      <input
        type="search"
        className="input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...rest}
      />
    </div>
  )
}