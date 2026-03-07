import React from "react";

const RescheduleAppointment = ({ slots = [], selectedTime, setSelectedTime }) => {

  return (
    <div className="mt-2">

      {/* Scrollable slot container */}
      <div className="max-h-[55vh] overflow-y-auto pr-1">

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">

          {slots.map((slot) => {
            const booked = slot.isBooked;

            return (
              <div
                key={slot.time}
                onClick={() => !booked && setSelectedTime(slot.time)}
                className={`rounded-md border p-2 text-center cursor-pointer transition
                  
                  ${booked
                    ? "border-red-300 bg-red-50 text-red-600 cursor-not-allowed"
                    : selectedTime === slot.time
                    ? "border-green-600 bg-green-200"
                    : "border-green-300 bg-green-50 hover:bg-green-100"}
                `}
              >

                <div className="text-sm font-semibold">
                  {slot.time}
                </div>

                <div className="text-xs text-gray-700">
                  ₹{slot.fee || 500}
                </div>

                {booked && (
                  <div className="text-[10px] mt-1">
                    Booked
                  </div>
                )}

              </div>
            );
          })}

        </div>

      </div>
    </div>
  );
};

export default RescheduleAppointment;