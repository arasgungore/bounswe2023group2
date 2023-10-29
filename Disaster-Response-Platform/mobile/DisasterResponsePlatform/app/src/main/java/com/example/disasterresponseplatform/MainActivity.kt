package com.example.disasterresponseplatform

import android.os.Bundle
import android.util.Log
import android.view.MenuItem
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.ActionBarDrawerToggle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.GravityCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentTransaction
import com.example.disasterresponseplatform.data.database.need.Need
import com.example.disasterresponseplatform.data.database.userdata.UserData
import com.example.disasterresponseplatform.data.database.action.Action
import com.example.disasterresponseplatform.data.enums.Urgency
import com.example.disasterresponseplatform.databinding.ActivityMainBinding
import com.example.disasterresponseplatform.managers.DiskStorageManager
import com.example.disasterresponseplatform.ui.HomePageFragment
import com.example.disasterresponseplatform.ui.activity.ActivityFragment
import com.example.disasterresponseplatform.ui.activity.need.NeedViewModel
import com.example.disasterresponseplatform.ui.activity.userdata.UserDataViewModel
import com.example.disasterresponseplatform.ui.activity.action.ActionViewModel
import com.example.disasterresponseplatform.ui.authentication.LoginFragment
import com.example.disasterresponseplatform.ui.authentication.RegistrationFragment
import com.example.disasterresponseplatform.ui.map.MapFragment
import com.example.disasterresponseplatform.ui.network.NetworkFragment
import com.example.disasterresponseplatform.ui.profile.ProfileFragment
import com.example.disasterresponseplatform.utils.DateUtil
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var homePageFragment: HomePageFragment
    private lateinit var networkFragment: NetworkFragment

    private val mapFragment = MapFragment()
    private val activityFragment = ActivityFragment()
    private val profileFragment = ProfileFragment()
    private val loginFragment = LoginFragment()
    private val registrationFragment = RegistrationFragment()

    private lateinit var needViewModel: NeedViewModel
    private lateinit var userDataViewModel: UserDataViewModel
    private lateinit var actionViewModel: ActionViewModel


    private lateinit var toggle: ActionBarDrawerToggle
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        //instead setContentView(R.layout.activity_main) doing that with binding
        setContentView(binding.root)
        homePageFragment = HomePageFragment(this)
        networkFragment = NetworkFragment(this)

        replaceFragment(homePageFragment)
        navBarListener()
        toggleListener()

        // it is created by dependency Injection without creating any of db, dao or repo
        val getNeedViewModel: NeedViewModel by viewModels()
        needViewModel = getNeedViewModel

        val getUserDataViewModel: UserDataViewModel by viewModels()
        userDataViewModel = getUserDataViewModel

        val getActionViewModel: ActionViewModel by viewModels()
        actionViewModel = getActionViewModel

    }

    private fun tryNeedViewModel(){
        val need = Need(null,"Egecan","Clothes","T-Shirt",DateUtil.getDate("dd-MM-yy").toString(),50,"İstanbul",Urgency.CRITICAL.type)
        needViewModel.insertNeed(need)
        val location = needViewModel.getLocation("Egecan")
        Toast.makeText(this,location,Toast.LENGTH_SHORT).show()
    }

    private fun tryUserDataViewModel() {
        val userData = UserData(null, "cahid", "cahid.keles@boun.edu.tr",
            "05340623847", "Cahid Enes", "Keleş", false,
            false, null, 0, false, null,
            null, null, null, null, null, null,
            null, null, null, null, null, null)
        userDataViewModel.insertUserData(userData)
        val email = userDataViewModel.getEmail("cahid")
        Toast.makeText(this,email,Toast.LENGTH_SHORT).show()
    }

    private fun tryActionViewModel(){
        val action = Action(null,"Halil","Search","Survivor",DateUtil.getDate("dd-MM-yy").toString(),50,"Ankara","Erzurum", Urgency.CRITICAL.type)
        actionViewModel.insertAction(action)
        val startLocation = actionViewModel.getStartLocation("Halil")
        Toast.makeText(this,startLocation,Toast.LENGTH_SHORT).show()
    }

    private fun toggleListener(){
        toggle = ActionBarDrawerToggle(this, binding.root,R.string.open,R.string.close) //like adapter
        binding.root.addDrawerListener(toggle) // add toggle into layout
        toggle.syncState() // to be ready to use
        // able to close navigation when clicked to back arrow
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        binding.navView.setNavigationItemSelectedListener {
            when(it.itemId){
                R.id.miLogin -> replaceNavFragment(loginFragment)
                R.id.miRegister -> replaceNavFragment(registrationFragment)
                R.id.miNetwork -> replaceNavFragment(networkFragment)
                R.id.miLogout -> logOutActions()
                R.id.miAddNeed -> tryNeedViewModel()
                R.id.miAddUserData -> tryUserDataViewModel()
                R.id.miAddAction -> tryActionViewModel()
            }
            binding.root.closeDrawer(GravityCompat.START) //whenever clicked item on drawer, closing it automatically
            true
        }
    }

    private fun logOutActions() {
        DiskStorageManager.removeKey("token")
    }
    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        if(toggle.onOptionsItemSelected(item)){
            return true // notifies that user clicked that toggle button
        }
        return super.onOptionsItemSelected(item)
    }

    /**
     * This function is for replacing corresponding fragments when user clicks corresponding navbar button.
     */
    private fun navBarListener(){
        binding.bottomNavigationView.setOnItemSelectedListener {menuItem ->
            when (menuItem.itemId){
                R.id.miHome -> replaceNavFragment(homePageFragment)
                R.id.miActivities -> replaceNavFragment(activityFragment)
                R.id.miMap -> replaceNavFragment(mapFragment)
                R.id.miProfile -> replaceNavFragment(profileFragment)
            }
            true
        }
    }

    /**
     * It closes fragments in backstack then replace the corresponding fragment.
     * i.e user selects home page when s/he is on add action fragment
     * this function firstly kills add action fragment, actionFragment, activityFragment correspondingly
     * then opens the home page fragment.
     */
    private fun replaceNavFragment(currentFragment: Fragment){
        // to prevent bugs when backstack is not empty
        val backStackEntryCount: Int = supportFragmentManager.backStackEntryCount
        for (i in 0 until backStackEntryCount) {
            Log.i("PopBackStack: ",i.toString())
            popFragment()
        }
        replaceFragment(currentFragment)
    }


    /** This adds fragments to the back stack, in this way user can return this fragment after the view has been changed.
     * and replace fragment.
     */
    fun addFragment(fragment: Fragment) {
        val ft: FragmentTransaction = supportFragmentManager.beginTransaction()
        ft.replace(R.id.container, fragment)
        ft.addToBackStack(null)
        ft.commit()
    }

    /**
     * This pops the fragment from fragment stack
     */
    private fun popFragment() {
        supportFragmentManager.popBackStack()
    }

    /**
     * This is for replacing the fragment without adding it to the stack
     * .apply means ft. in addFragment
     */
    private fun replaceFragment(fragment: Fragment) {
        supportFragmentManager.beginTransaction().apply {
            replace(R.id.container, fragment) //replacing fragment
            commit() //call signals to the FragmentManager that all operations have been added to the transaction
        }
    }
}