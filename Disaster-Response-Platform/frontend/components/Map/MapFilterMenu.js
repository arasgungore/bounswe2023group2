import styles from "./MapFilterMenu.module.scss";
import { FaSearch } from "react-icons/fa";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { withIronSessionApiRoute } from "iron-session/next";
import "react-toastify/dist/ReactToastify.css";
import Search from "../Search";
import { Input } from "@nextui-org/react";
import Filter from "../Filter";
import { api } from "@/lib/apiUtils";
import {
  Tab,
  Tabs,
  Divider,
  CheckboxGroup,
  Checkbox,
  Button,
} from "@nextui-org/react";

export default function MapFilterMenu({
  activateClick,
  setResourceApiData,
  setNeedApiData,
  setEventApiData,
  isMapSelected,
  selectMap,
  labels,
  bounds,
  chosenActivityType,
  setChosenActivityType,
}) {
  const [resourceChecked, setResourceChecked] = useState(false);
  const [aktifChecked, setAktifChecked] = useState(false);
  const [eventChecked, setEventChecked] = useState(false);
  const [actionsChecked, setActionsChecked] = useState(false);
  const [needsChecked, setNeedsChecked] = useState(false);
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");
  const [activities, setActivities] = useState([]); // [{_id: "loading"}
  const types = [
    "cloth",
    "food",
    "drink",
    "shelter",
    "medication",
    "transportation",
    "tool",
    "human",
    "other",
  ];
  const urgency = [1, 2, 3, 4, 5];
  const status = ["active", "inactive"];
  useEffect(() => {
    fetchResources();
    fetchNeeds();
    fetchEvents();
  }, []);
  function toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
  function toDegrees(radians) {
    return radians * (180 / Math.PI);
  }
  const scanScreen = (bounds) => {
    console.log(bounds);
    let boundsArray = bounds.split(",");
    const lat1 = Number(boundsArray[0]);
    const lat2 = Number(boundsArray[2]);
    const lon1 = Number(boundsArray[1]);
    const lon2 = Number(boundsArray[3]);
    const dWT = Math.sqrt((lat1-lat2)**2 + (lon1-lon2)**2);
    const φ1 = (lat1 * Math.PI) / 180,
      φ2 = (lat2 * Math.PI) / 180,
      Δλ = ((lon2 - lon1) * Math.PI) / 180,
      R = 6371e3;
    const d =
      Math.acos(
        Math.sin(φ1) * Math.sin(φ2) + Math.cos(φ1) * Math.cos(φ2) * Math.cos(Δλ)
      ) * R;
    
    
    let dLon = toRadians(lon2 - lon1);
      
    let lat1r = toRadians(lat1);
    let lat2r = toRadians(lat2);
    let lon1r = toRadians(lon1);
    
    let Bx = Math.cos(lat2r) * Math.cos(dLon);
    let By = Math.cos(lat2r) * Math.sin(dLon);
    const lat3 = toDegrees(Math.atan2(Math.sin(lat1r) + Math.sin(lat2r), Math.sqrt((Math.cos(lat1r) + Bx) * (Math.cos(lat1r) + Bx) + By * By)));
    const lon3 = toDegrees(lon1r + Math.atan2(By, Math.cos(lat1r) + Bx));

    
    
    setFilters({ ...filters,x:lon3, y: lat3,  distance_max:dWT });
    console.log(dWT);
    console.log("x : ", lon3," y: ",lat3)
    filterActivities();
  };

  const notifyAdd = () => {
    toast.info(labels.map.choose_location, {
      position: "top-center",
      autoClose: 5000, // Auto close the notification after 3 seconds (adjust as needed)
    });
  };
  const filterActivities = async () => {
    let response;
    if (chosenActivityType === "need") {
      let my_filter = new URLSearchParams(filters).toString();
      
      response = await api.get(`/api/needs/?${my_filter}`, {
        headers: { "Content-Type": "application/json" },
      });
      let res = response.data;
      if (response.status === 200) {
        setNeedApiData(res.needs);
      } else {
        toast.error(labels.feedback.failure);
      }
    } else if (chosenActivityType === "resource") {
      let my_filter = new URLSearchParams(filters).toString();

      response = await api.get(`/api/resources/?${my_filter}`, {
        headers: { "Content-Type": "application/json" },
      });
      let res = response.data;

      setResourceApiData(res.resources);
      if (response.status === 200) {
        setResourceApiData(res.resources);
      } else {
        toast.error(labels.feedback.failure);
      }
    } else if (chosenActivityType === "all") {
      let my_filter = new URLSearchParams(filters).toString();
      console.log(my_filter);
      const resourceResponse = await api.get(`/api/resources/?${my_filter}`, {
        headers: { "Content-Type": "application/json" },
      });
      const needResponse = await api.get(`/api/needs/?${my_filter}`, {
        headers: { "Content-Type": "application/json" },
      });

      let nRes = needResponse.data;
      let rRes = resourceResponse.data;
      console.log(nRes);
      console.log(rRes);
      setResourceApiData(rRes.resources);
      if (resourceResponse.status === 200) {
        setResourceApiData(rRes.resources);
      } else {
        toast.error(labels.feedback.failure);
      }

      setNeedApiData(nRes.needs);
      if (needResponse.status === 200) {
        setNeedApiData(nRes.needs);
      } else {
        toast.error(labels.feedback.failure);
      }
    }
  };
  const downloadFile = async () => {
    const response = await fetch("/api/download/download", {
      method: "POST",
      filter: filters,
    });
    // try {

    //   let my_filter = new URLSearchParams(filters).toString();
    //   response = await api.post(`/api/donwloadfile/?activity_type=Need`, {
    //     headers: { Authorization: `Bearer ${accessToken}`,
    //     'Content-Type': 'application/json' },
    //   });
    //   console.log(response)
    //   response = await api.post(`/api/donwloadfile/?activity_type=Resource`, {
    //     headers: { Authorization: `Bearer ${accessToken}`,
    //     'Content-Type': 'application/json' },
    //   });
    //   console.log(response)

    // }
    // catch (error) {
    //   // Handle unexpected errors
    //   console.error("Error:", error);
    // }
  };
  const fetchResources = async () => {
    try {
      // Make API call to filter resources based on the search term
      //const searchTerm = /* Get the search term from your input field */;
      const resourceResponse = await api.get(
        `/api/resources/?sort_by=created_at&order=asc`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          // Additional headers or credentials if needed
        }
      );

      if (resourceResponse.status == 200) {
        const resources = await resourceResponse.data;
        // Process the data as needed

        setResourceApiData(resources.resources);
        resources.resources.forEach((resource) => {
          const xValue = resource.x;
          const yValue = resource.y;
        });
      } else {
        // Handle errors
        console.error(
          "Error fetching filtered resources:",
          response.statusText
        );
      }
    } catch (error) {
      // Handle unexpected errors
      console.error("Error:", error);
    }
  };

  const fetchNeeds = async () => {
    const needResponse = await api.get(
      `/api/needs/?sort_by=created_at&order=asc`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Additional headers or credentials if needed
      }
    );

    if (needResponse.status == 200) {
      const needs = await needResponse.data;
      // Process the data as needed

      setNeedApiData(needs.needs);
      needs.needs.forEach((resource) => {
        const xValue = resource.x;
        const yValue = resource.y;
      });
    } else {
      // Handle errors
      console.error("Error fetching filtered resources:", needs.statusText);
    }
  };
  const fetchEvents = async () => {
    const eventResponse = await api.get(`/api/events/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Additional headers or credentials if needed
    });

    if (eventResponse.status == 200) {
      const events = await eventResponse.data;
      // Process the data as needed

      setEventApiData(events.events);
      events.events.forEach((event) => {
        const xValue = event.x;
        const yValue = event.y;
      });
    } else {
      // Handle errors
      console.error(
        "Error fetching filtered resources:",
        eventResponse.statusText
      );
    }
  };

  // const handleFilterClick = async () => {
  //   console.log("I am in handleFilterClick");
  //   try {
  //     // Make API call to filter resources based on the search term
  //     //const searchTerm = /* Get the search term from your input field */;

  //     const eventResponse = await api.get(
  //       `/api/resources/?sort_by=created_at&order=asc`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         // Additional headers or credentials if needed
  //       }
  //     );
  //     console.log("consolelog:", eventResponse.status);
  //     if (eventResponse.status == 200) {
  //       const events = await eventResponse.data;
  //       // Process the data as needed
  //       console.log("Filtered Resources:", events);
  //       setEventApiData(events.events);
  //       events.events.forEach((event) => {
  //         const xValue = event.x;
  //         const yValue = event.y;
  //         console.log(`Resource ID: ${event._id}, X: ${xValue}, Y: ${yValue}`);
  //       });
  //     } else {
  //       // Handle errors
  //       console.error(
  //         "Error fetching filtered resources:",
  //         eventResponse.statusText
  //       );
  //     }

  //     const resourceResponse = await api.get(
  //       `/api/resources/?sort_by=created_at&order=asc`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         // Additional headers or credentials if needed
  //       }
  //     );
  //     console.log("consolelog:", resourceResponse.status);
  //     if (resourceResponse.status == 200) {
  //       const resources = await resourceResponse.data;
  //       // Process the data as needed
  //       console.log("Filtered Resources:", resources);
  //       setResourceApiData(resources.resources);
  //       resources.resources.forEach((resource) => {
  //         const xValue = resource.x;
  //         const yValue = resource.y;
  //         console.log(
  //           `Resource ID: ${resource._id}, X: ${xValue}, Y: ${yValue}`
  //         );
  //       });
  //     } else {
  //       // Handle errors
  //       console.error(
  //         "Error fetching filtered resources:",
  //         response.statusText
  //       );
  //     }

  //     const needResponse = await api.get(
  //       `/api/needs/?sort_by=created_at&order=asc`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         // Additional headers or credentials if needed
  //       }
  //     );
  //     console.log("consolelog:", needResponse.status);
  //     if (needResponse.status == 200) {
  //       const needs = await needResponse.data;
  //       // Process the data as needed
  //       console.log("Filtered Needs:", needs);
  //       setNeedApiData(needs.needs);
  //       needs.needs.forEach((resource) => {
  //         const xValue = resource.x;
  //         const yValue = resource.y;
  //         console.log(
  //           `Resource ID: ${resource._id}, X: ${xValue}, Y: ${yValue}`
  //         );
  //       });
  //     } else {
  //       // Handle errors
  //       console.error("Error fetching filtered resources:", needs.statusText);
  //     }
  //   } catch (error) {
  //     // Handle unexpected errors
  //     console.error("Error:", error);
  //   }
  // };

  const getCursorColor = (type) => {
    switch (type) {
      case "need":
        return "bg-blue-500"; // Replace with your desired blue color
      case "resource":
        return "bg-green-500"; // Replace with your desired green color
      case "event":
        return "bg-red-500"; // Replace with your desired red color
      default:
        return "bg-yellow-400"; // Default color
    }
  };

  const handleSubmit = async (text) => {
    text.preventDefault();

    if (chosenActivityType === undefined) {
      toast.error("Please choose an activity type");
      return;
    }
    const response = await fetch(`/api/search`, {
      method: "POST",
      body: JSON.stringify({ query: search, activityType: chosenActivityType }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    let payload = await response.json();
    if (response.status !== 200) {
      toast.error(payload?.message);
      return;
    }
    const results = payload.results;
    setActivities(results);
  };

  const popup = () => {
    selectMap();
    onOpen();
    [];
  };

  return (
    <div className={styles.main}>
      <div className={styles.searchBox}>
        <div className={styles.search}>
          {/* <input
            type="text"
            className={styles.searchTerm}
            placeholder={labels.placeholders.search_bar}
          ></input> */}
          <Input
            className={styles.searchTerm}
            id="search"
            placeholder="Type to search..."
            size="sm"
            onChange={(text) => setSearch(text.target.value)}
            // startContent={<FaSearch className={styles.searchTerm} />}
            type="search"
          />
          <button type="submit" className={styles.searchButton}>
            <FaSearch />
          </button>
        </div>
      </div>
      <div className="CheckBox">
        <div className={styles.header}>{labels.sort_filter.filters}</div>
        <hr
          style={{
            background: "gray",
            borderColor: "gray",
            height: "1px",
            alignSelf: "center",
          }}
        />

        <Tabs
          selectedKey={chosenActivityType}
          onSelectionChange={setChosenActivityType}
          size="lg"
          radius="full"
          classNames={{
            cursor: getCursorColor(chosenActivityType),
            tab: `flex`,
          }}
        >
          <Tab
            key="need"
            className={`${
              chosenActivityType === "need" ? "bg-blue-400 z-10" : "bg-gray-200"
            } text-slate-50 flex justify-center items-center px-2 py-1 text-xs max-w-[25%]`}
            titleValue={labels.activities.needs}
            title={labels.activities.needs}
          />
          <Tab
            key="resource"
            className={`${
              chosenActivityType === "resource"
                ? "bg-green-400 z-10"
                : "bg-gray-200"
            } text-slate-50 flex justify-center items-center px-2 py-1 text-xs max-w-[25%]`}
            titleValue={labels.activities.resources}
            title={labels.activities.resources}
          />
          <Tab
            key="event"
            className={`${
              chosenActivityType === "event" ? "bg-red-400 z-10" : "bg-gray-200"
            } text-slate-50 flex justify-center items-center px-2 py-1 text-xs max-w-[25%] `}
            titleValue={labels.activities.events}
            title={labels.activities.events}
          />
          <Tab
            key="all"
            className={`${
              chosenActivityType === "all"
                ? "bg-yellow-400 z-10"
                : "bg-gray-200"
            } text-slate-50 flex justify-center items-center px-2 py-1 text-xs max-w-[25%]`}
            titleValue={labels.activities.all}
            title={labels.activities.all}
          />
        </Tabs>

        <div className="px-3 py-2 w-full">
          <p className="text-small text-black font-bold text-foreground">
            {labels.sort_filter.filter}
          </p>
          <div className="mt-2 flex flex-col gap-2 w-full">
            <Divider />

            <CheckboxGroup
              label={labels.sort_filter.types}
              orientation="horizontal"
              defaultValue={[]}
              onValueChange={(e) => {
                setFilters({ ...filters, types: e });
              }}
            >
              {types.map((type) => (
                <Checkbox value={type}>{type}</Checkbox>
              ))}
            </CheckboxGroup>

            <CheckboxGroup
              label={labels.sort_filter.urgency}
              orientation="horizontal"
              color="secondary"
              defaultValue={[]}
              onValueChange={(e) => {
                setFilters({ ...filters, urgency: e });
              }}
            >
              {urgency.map((urgent) => (
                <Checkbox value={urgent}>{urgent}</Checkbox>
              ))}
            </CheckboxGroup>

            <CheckboxGroup
              label={labels.sort_filter.status}
              orientation="horizontal"
              color="secondary"
              defaultValue={[]}
              onValueChange={(e) => {
                setFilters({ ...filters, status: e });
              }}
            >
              {status.map((stat) => (
                <Checkbox value={stat}>{labels.sort_filter[stat]}</Checkbox>
              ))}
            </CheckboxGroup>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          scanScreen(bounds);
        }}
        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded w-full"
        // absolute bottom-30 right-0.5"
      >
        {labels.map.scan_certain_area}
      </button>

      <button
        onClick={() => {
          filterActivities();
        }}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
        // absolute bottom-20 right-0.5"
      >
        {labels.sort_filter.filter}
      </button>
      <button
        onClick={() => {
          fetchResources();
          fetchNeeds();
          fetchEvents();
        }}
        className="bg-red-200 hover:bg-red-400 text-white font-bold py-2 px-4 rounded w-full"
        // absolute bottom-10 right-0.5"
      >
        {labels.sort_filter.filter_reset}
      </button>

      <button
        onClick={() => {
          download();
        }}
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded w-full
           absolute bottom-10 right-0.5"
      >
        {labels.map.download}
      </button>
      <button
        onClick={() => {
          activateClick();
          notifyAdd();
        }}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full
           absolute bottom-0 right-0.5"
      >
        {labels.activities.add_resource}
      </button>

      {isMapSelected ? popup() : <></>}
      <ToastContainer />
    </div>
  );
}
