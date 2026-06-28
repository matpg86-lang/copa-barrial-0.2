const views = {

    dashboard: showDashboard,

    tournaments: showTournaments,

    teams: showTeams

};

function navigate(view){

    document
        .querySelectorAll(".menu-item")
        .forEach(item=>{

            item.classList.remove("active");

        });

    document
        .querySelector(`[data-view="${view}"]`)
        ?.classList.add("active");

    views[view]();

}