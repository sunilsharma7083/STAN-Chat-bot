// Cleanup script to fix incorrect memory data
const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  profile: {
    name: String,
    favoriteColor: String,
    location: String,
    preferredTone: String
  },
  memory: {
    shortTermFacts: [String],
    longTermMemories: [String],
    interests: [String]
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function cleanupMemory() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users\n`);

    let fixedCount = 0;

    for (const user of users) {
      let needsUpdate = false;
      console.log(`\n👤 User: ${user.userId}`);
      console.log(`   Current Name: ${user.profile.name || 'Not set'}`);

      // Fix incorrect names - expanded list of false positives
      const falsePositives = [
        'also', 'Also', 'here', 'Here', 'good', 'Good', 'fine', 'Fine',
        'feel', 'Feel', 'sad', 'Sad', 'so', 'So', 'very', 'Very',
        'just', 'Just', 'now', 'Now', 'then', 'Then', 'okay', 'Okay'
      ];
      if (user.profile.name && falsePositives.includes(user.profile.name)) {
        console.log(`   ❌ Found incorrect name: "${user.profile.name}" - removing it`);
        user.profile.name = undefined;
        needsUpdate = true;
      }

      // Clean up facts containing false positive names
      if (user.memory.shortTermFacts && user.memory.shortTermFacts.length > 0) {
        const originalLength = user.memory.shortTermFacts.length;
        user.memory.shortTermFacts = user.memory.shortTermFacts.filter(fact => {
          const hasIncorrectName = falsePositives.some(fp => 
            fact.toLowerCase().includes(`name is ${fp.toLowerCase()}`)
          );
          if (hasIncorrectName) {
            console.log(`   ❌ Removing incorrect fact: "${fact}"`);
          }
          return !hasIncorrectName;
        });
        if (user.memory.shortTermFacts.length < originalLength) {
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await user.save();
        fixedCount++;
        console.log(`   ✅ User profile updated`);
      } else {
        console.log(`   ✓ No issues found`);
      }
    }

    console.log(`\n\n🎉 Cleanup complete!`);
    console.log(`   Fixed ${fixedCount} user(s)`);
    
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanupMemory();
