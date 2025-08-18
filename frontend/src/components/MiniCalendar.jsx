import { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isToday } from "date-fns";

export default function MiniCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-4">
      <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>&lt;</button>
      <span className="text-md font-semibold">{format(currentMonth, "MMMM yyyy")}</span>
      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>&gt;</button>
    </div>
  );

  const renderDays = () => {
    const days = ["L", "M", "M", "J", "V", "S", "D"];
    return (
      <div className="grid grid-cols-7 text-center text-sm text-gray-500 mb-2">
        {days.map((day, idx) => (
          <div key={idx}>{day}</div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isTodayDate = isToday(day);
        days.push(
          <div
            key={day}
            className={`text-center text-sm py-1 rounded-full mx-auto w-8 h-8 flex items-center justify-center
              ${!isCurrentMonth ? "text-gray-300" : ""}
              ${isTodayDate ? "bg-[#D0FF34] text-[#111A3A] font-bold" : ""}
              hover:bg-gray-200 cursor-default`}
          >
            {formattedDate}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="grid grid-cols-7" key={day}>{days}</div>);
      days = [];
    }

    return <div>{rows}</div>;
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 w-full max-w-xs">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
}