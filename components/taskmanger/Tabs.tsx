import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TaskTabs = ({
  tabs,
  selected,
  setSelected,
  children,
}: {
  tabs: { title: string; icon: any }[];
  selected: string;
  setSelected: (value: string) => void;
  children?: React.ReactNode;
}) => {
  return (
    <div className="w-full px-1 sm:px-0">
      <Tabs value={selected} className="w-[800px]">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.title}
              value={tab.title}
              onClick={() => setSelected(tab.title)}
              className="w-fit flex items-center outline-none gap-2 px-3 py-2.5 text-base font-medium leading-5 bg-white"
            >
              {tab.icon}
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Render the content based on the selected tab */}
        {tabs.map((tab) => (
          <TabsContent key={tab.title} value={tab.title}>
            {selected === tab.title && children}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TaskTabs;
