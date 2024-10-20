//assets
import BadgeIcon from '@mui/icons-material/Badge';
//contans
const icons = {BadgeIcon}
// ==============================|| EMPLOYEERS MENU ITEMS ||============================== //


const employeers = {
    id: 'employeers',
    title: "Xodimlar",
    type: "group",
    children: [
        {
            id: 'inspectors',
            title: "Nazoratchilar",
            type: 'item',
            url: '/employeers/inspectors',
            icon: icons.BadgeIcon,
             breadcrumbs: false
        }
    ]
}

export default employeers