import { Search } from "lucide-react";
import { ISearchFilters } from "src/lib/interfaces";
import { Input } from "../ui/input";
const SearchFilter: React.FC<ISearchFilters> = ({
  searchString,
  setSearchString,
  title,
  className,
  setIsSearchOpen,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const trimmedValue = value.replace(/\s+/g, " ");
    setSearchString(trimmedValue);
  };

  const handleSearchString = () => {
    setSearchString("")
    if (setIsSearchOpen) {
      setIsSearchOpen(false);
    }
  }
  return (
    <div className={`relative  text-xs 3xl:text-sm ${className}`}>
      <Search className="absolute left-1 top-1/2 -translate-y-1/2 bg-transparent opacity-50 rounded-none w-6 h-6 p-1" />
      <Input
        placeholder={title}
        value={searchString}
        onChange={handleInputChange}
        className="px-8 py-2 bg-white rounded-md border-0 outline-none ring-0 shadow-none w-full h-full placeholder:text-xs focus:border-0 focus:outline-none focus:ring-0 focus:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-xs 3xl:text-sm font-normal"
      />
      {searchString && (
        <button
          onClick={handleSearchString}
          className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer bg-transparent text-xs "
        >
          X
        </button>
      )}     </div>
  );
};

export default SearchFilter;
