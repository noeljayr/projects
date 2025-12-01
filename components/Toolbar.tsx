import { IconSearch } from "@tabler/icons-react";
import ContentNavigation from "./ContentNavigation";

function Toolbar() {
  return (
    <div className="w-full items-center">
      <div className="flex items-center space-x-2 max-sm:flex-col max-sm:items-start max-sm:space-x-0 max-sm:gap-4">
        <ContentNavigation />

        <div className="grid grid-cols-[1fr_auto] ml-auto max-sm:ml-0 max-sm:w-full p-1 border border-[var(--c-border)] rounded-[0.5rem] w-[20rem] bg-[#F7E4D4] h-[2rem]">
          <input
            type="text"
            placeholder={"Suchen"}
            className="outline-0 border-0 bg-transparent h-full font-p3 pl-2 font-medium w-full"
          />
          <button className="bg-[#58483B] h-[1.35rem] w-[1.35rem] cursor-pointer rounded-[0.35rem] flex items-center justify-center">
            <IconSearch className="h-3 w-3 opacity-75 " color="white" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Toolbar;
