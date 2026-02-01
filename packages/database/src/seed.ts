import {
  PrismaClient,
  LicenseTier,
  UserRole,
  EventType,
  EventStatus,
  AttendeeType,
  OrderStatus,
  PaymentStatus,
  PaymentProvider,
  TicketStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Helper to generate random order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

// Helper to generate ticket number
function generateTicketNumber(): string {
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `TKT-${random}`;
}

// Helper to generate QR code
function generateQRCode(): string {
  return `QR-${Date.now()}-${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
}

// Sample attendee data for realistic demos
const sampleAttendees = [
  { firstName: 'Emma', lastName: 'Johnson', email: 'emma.johnson@techcorp.io', company: 'TechCorp', jobTitle: 'Senior Developer' },
  { firstName: 'Liam', lastName: 'Williams', email: 'liam.w@startuplab.com', company: 'StartupLab', jobTitle: 'CTO' },
  { firstName: 'Olivia', lastName: 'Brown', email: 'olivia.brown@innovate.co', company: 'Innovate Inc', jobTitle: 'Product Manager' },
  { firstName: 'Noah', lastName: 'Jones', email: 'noah.j@cloudnine.tech', company: 'CloudNine', jobTitle: 'DevOps Engineer' },
  { firstName: 'Ava', lastName: 'Garcia', email: 'ava.garcia@datadriven.io', company: 'DataDriven', jobTitle: 'Data Scientist' },
  { firstName: 'Ethan', lastName: 'Miller', email: 'ethan.m@webworks.com', company: 'WebWorks', jobTitle: 'Frontend Lead' },
  { firstName: 'Sophia', lastName: 'Davis', email: 'sophia.d@aiventures.ai', company: 'AI Ventures', jobTitle: 'ML Engineer' },
  { firstName: 'Mason', lastName: 'Rodriguez', email: 'mason.r@scalable.io', company: 'Scalable Systems', jobTitle: 'Backend Developer' },
  { firstName: 'Isabella', lastName: 'Martinez', email: 'isabella.m@designstudio.co', company: 'Design Studio', jobTitle: 'UX Designer' },
  { firstName: 'William', lastName: 'Anderson', email: 'will.a@securetech.com', company: 'SecureTech', jobTitle: 'Security Analyst' },
  { firstName: 'Mia', lastName: 'Taylor', email: 'mia.taylor@fintech.io', company: 'FinTech Solutions', jobTitle: 'Software Architect' },
  { firstName: 'James', lastName: 'Thomas', email: 'james.t@mobileapp.dev', company: 'MobileApp Dev', jobTitle: 'iOS Developer' },
  { firstName: 'Charlotte', lastName: 'Hernandez', email: 'charlotte.h@quantum.tech', company: 'Quantum Tech', jobTitle: 'Research Engineer' },
  { firstName: 'Benjamin', lastName: 'Moore', email: 'ben.moore@cloudops.io', company: 'CloudOps', jobTitle: 'SRE' },
  { firstName: 'Amelia', lastName: 'Martin', email: 'amelia.m@healthtech.com', company: 'HealthTech', jobTitle: 'Full Stack Developer' },
  { firstName: 'Lucas', lastName: 'Jackson', email: 'lucas.j@edtech.io', company: 'EdTech Plus', jobTitle: 'Engineering Manager' },
  { firstName: 'Harper', lastName: 'Thompson', email: 'harper.t@greentech.co', company: 'GreenTech', jobTitle: 'Sustainability Engineer' },
  { firstName: 'Henry', lastName: 'White', email: 'henry.w@robotics.ai', company: 'Robotics AI', jobTitle: 'Robotics Engineer' },
  { firstName: 'Evelyn', lastName: 'Harris', email: 'evelyn.h@biotech.com', company: 'BioTech Labs', jobTitle: 'Bioinformatics Lead' },
  { firstName: 'Alexander', lastName: 'Sanchez', email: 'alex.s@gamedev.io', company: 'GameDev Studio', jobTitle: 'Game Developer' },
];

async function main() {
  console.log('Seeding database...');

  // Create demo organization
  const organization = await prisma.organization.upsert({
    where: { slug: 'demo-org' },
    update: {},
    create: {
      name: 'Demo Organization',
      slug: 'demo-org',
      licenseTier: LicenseTier.PROFESSIONAL,
      timezone: 'America/New_York',
      currency: 'USD',
      websiteUrl: 'https://demo-events.example.com',
    },
  });

  console.log('Created organization:', organization.name);

  // Create demo user
  const passwordHash = await bcrypt.hash('demo123456', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      passwordHash,
      firstName: 'Demo',
      lastName: 'User',
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log('Created user:', user.email);

  // Link user to organization
  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      organizationId: organization.id,
      userId: user.id,
      role: UserRole.OWNER,
    },
  });

  console.log('Linked user to organization');

  // Create multiple demo events with different statuses
  const events = await Promise.all([
    // Main published event
    prisma.event.upsert({
      where: {
        organizationId_slug: {
          organizationId: organization.id,
          slug: 'tech-summit-2025',
        },
      },
      update: {},
      create: {
        organizationId: organization.id,
        name: 'Tech Summit 2025',
        slug: 'tech-summit-2025',
        description:
          'The premier technology conference bringing together industry leaders, innovators, and tech enthusiasts.',
        shortDescription: 'The premier technology conference of the year.',
        type: EventType.HYBRID,
        status: EventStatus.PUBLISHED,
        startDate: new Date('2025-06-15T09:00:00Z'),
        endDate: new Date('2025-06-17T18:00:00Z'),
        timezone: 'America/New_York',
        venueName: 'Convention Center',
        venueAddress: '123 Tech Boulevard',
        venueCity: 'San Francisco',
        venueCountry: 'United States',
        currency: 'USD',
        maxAttendees: 5000,
        isPublic: true,
        publishedAt: new Date(),
      },
    }),
    // Draft event
    prisma.event.upsert({
      where: {
        organizationId_slug: {
          organizationId: organization.id,
          slug: 'developer-workshop-2025',
        },
      },
      update: {},
      create: {
        organizationId: organization.id,
        name: 'Developer Workshop Series',
        slug: 'developer-workshop-2025',
        description: 'Hands-on workshops for developers of all skill levels.',
        shortDescription: 'Learn by doing with expert-led workshops.',
        type: EventType.IN_PERSON,
        status: EventStatus.DRAFT,
        startDate: new Date('2025-08-20T10:00:00Z'),
        endDate: new Date('2025-08-20T17:00:00Z'),
        timezone: 'America/New_York',
        venueName: 'Tech Hub',
        venueAddress: '456 Innovation Drive',
        venueCity: 'Austin',
        venueCountry: 'United States',
        currency: 'USD',
        maxAttendees: 100,
        isPublic: true,
      },
    }),
    // Completed event
    prisma.event.upsert({
      where: {
        organizationId_slug: {
          organizationId: organization.id,
          slug: 'startup-pitch-night-2024',
        },
      },
      update: {},
      create: {
        organizationId: organization.id,
        name: 'Startup Pitch Night 2024',
        slug: 'startup-pitch-night-2024',
        description: 'Watch 10 promising startups pitch to top VCs.',
        shortDescription: 'The best startup pitches of the year.',
        type: EventType.HYBRID,
        status: EventStatus.COMPLETED,
        startDate: new Date('2024-11-15T18:00:00Z'),
        endDate: new Date('2024-11-15T22:00:00Z'),
        timezone: 'America/New_York',
        venueName: 'Innovation Center',
        venueAddress: '789 Venture Way',
        venueCity: 'New York',
        venueCountry: 'United States',
        currency: 'USD',
        maxAttendees: 300,
        isPublic: true,
        publishedAt: new Date('2024-09-01'),
      },
    }),
    // Another published event
    prisma.event.upsert({
      where: {
        organizationId_slug: {
          organizationId: organization.id,
          slug: 'ai-ml-conference-2025',
        },
      },
      update: {},
      create: {
        organizationId: organization.id,
        name: 'AI & ML Conference 2025',
        slug: 'ai-ml-conference-2025',
        description: 'Explore the latest advancements in artificial intelligence and machine learning.',
        shortDescription: 'Leading the AI revolution.',
        type: EventType.VIRTUAL,
        status: EventStatus.PUBLISHED,
        startDate: new Date('2025-09-10T09:00:00Z'),
        endDate: new Date('2025-09-12T18:00:00Z'),
        timezone: 'America/Los_Angeles',
        virtualPlatformUrl: 'https://virtual.example.com/ai-ml-2025',
        currency: 'USD',
        maxAttendees: 10000,
        isPublic: true,
        publishedAt: new Date(),
      },
    }),
    // Cancelled event
    prisma.event.upsert({
      where: {
        organizationId_slug: {
          organizationId: organization.id,
          slug: 'blockchain-summit-2025',
        },
      },
      update: {},
      create: {
        organizationId: organization.id,
        name: 'Blockchain Summit 2025',
        slug: 'blockchain-summit-2025',
        description: 'Deep dive into blockchain technology and Web3.',
        shortDescription: 'The future of decentralization.',
        type: EventType.IN_PERSON,
        status: EventStatus.CANCELLED,
        startDate: new Date('2025-07-01T09:00:00Z'),
        endDate: new Date('2025-07-02T18:00:00Z'),
        timezone: 'America/New_York',
        venueName: 'Crypto Center',
        venueAddress: '321 Chain Street',
        venueCity: 'Miami',
        venueCountry: 'United States',
        currency: 'USD',
        maxAttendees: 500,
        isPublic: true,
      },
    }),
  ]);

  const mainEvent = events[0];
  const completedEvent = events[2];
  const aiEvent = events[3];

  console.log('Created events:', events.length);

  // Create ticket types for main event
  const ticketTypes = await Promise.all([
    prisma.ticketType.upsert({
      where: {
        id: 'general-admission',
      },
      update: {},
      create: {
        id: 'general-admission',
        eventId: mainEvent.id,
        name: 'General Admission',
        description: 'Access to all keynotes and general sessions',
        price: 299,
        quantity: 3000,
        earlyBirdPrice: 199,
        earlyBirdEndDate: new Date('2025-04-01'),
        sortOrder: 1,
      },
    }),
    prisma.ticketType.upsert({
      where: {
        id: 'vip-pass',
      },
      update: {},
      create: {
        id: 'vip-pass',
        eventId: mainEvent.id,
        name: 'VIP Pass',
        description: 'All-access pass including workshops, networking events, and exclusive sessions',
        price: 799,
        quantity: 500,
        earlyBirdPrice: 599,
        earlyBirdEndDate: new Date('2025-04-01'),
        sortOrder: 2,
      },
    }),
    prisma.ticketType.upsert({
      where: {
        id: 'virtual-only',
      },
      update: {},
      create: {
        id: 'virtual-only',
        eventId: mainEvent.id,
        name: 'Virtual Pass',
        description: 'Stream all sessions online with on-demand access for 30 days',
        price: 99,
        sortOrder: 3,
      },
    }),
  ]);

  console.log('Created ticket types:', ticketTypes.length);

  // Create sessions
  const sessions = await Promise.all([
    prisma.eventSession.create({
      data: {
        eventId: mainEvent.id,
        title: 'Opening Keynote: The Future of AI',
        description: 'An inspiring look at where AI is headed in the next decade.',
        startTime: new Date('2025-06-15T09:00:00Z'),
        endTime: new Date('2025-06-15T10:30:00Z'),
        track: 'Main Stage',
        roomName: 'Grand Ballroom',
        capacity: 5000,
        sortOrder: 1,
      },
    }),
    prisma.eventSession.create({
      data: {
        eventId: mainEvent.id,
        title: 'Building Scalable Systems',
        description: 'Best practices for building systems that scale to millions of users.',
        startTime: new Date('2025-06-15T11:00:00Z'),
        endTime: new Date('2025-06-15T12:00:00Z'),
        track: 'Engineering',
        roomName: 'Room A',
        capacity: 500,
        sortOrder: 2,
      },
    }),
    prisma.eventSession.create({
      data: {
        eventId: mainEvent.id,
        title: 'Product Design Workshop',
        description: 'Hands-on workshop on user-centered design principles.',
        startTime: new Date('2025-06-15T14:00:00Z'),
        endTime: new Date('2025-06-15T17:00:00Z'),
        track: 'Design',
        roomName: 'Workshop Room 1',
        capacity: 50,
        requiresTicket: true,
        sortOrder: 3,
      },
    }),
  ]);

  console.log('Created sessions:', sessions.length);

  // Create speakers
  const speakers = await Promise.all([
    prisma.speaker.create({
      data: {
        eventId: mainEvent.id,
        firstName: 'Sarah',
        lastName: 'Chen',
        email: 'sarah.chen@example.com',
        title: 'Chief Technology Officer',
        company: 'TechCorp',
        bio: 'Sarah is a visionary leader with 20 years of experience in the tech industry.',
        linkedinUrl: 'https://linkedin.com/in/sarahchen',
        sortOrder: 1,
      },
    }),
    prisma.speaker.create({
      data: {
        eventId: mainEvent.id,
        firstName: 'Michael',
        lastName: 'Rodriguez',
        email: 'michael.r@example.com',
        title: 'Principal Engineer',
        company: 'ScaleUp Inc',
        bio: 'Michael specializes in distributed systems and has led teams at multiple startups.',
        linkedinUrl: 'https://linkedin.com/in/michaelrodriguez',
        sortOrder: 2,
      },
    }),
  ]);

  console.log('Created speakers:', speakers.length);

  // Create registration form
  const form = await prisma.registrationForm.create({
    data: {
      eventId: mainEvent.id,
      name: 'Standard Registration',
      isDefault: true,
      fields: {
        create: [
          {
            name: 'dietary_requirements',
            label: 'Dietary Requirements',
            type: 'SELECT',
            options: JSON.stringify(['None', 'Vegetarian', 'Vegan', 'Gluten-free', 'Halal', 'Kosher', 'Other']),
            isRequired: false,
            sortOrder: 1,
          },
          {
            name: 'company',
            label: 'Company',
            type: 'TEXT',
            isRequired: true,
            sortOrder: 2,
          },
          {
            name: 'job_title',
            label: 'Job Title',
            type: 'TEXT',
            isRequired: true,
            sortOrder: 3,
          },
          {
            name: 'tshirt_size',
            label: 'T-Shirt Size',
            type: 'SELECT',
            options: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
            isRequired: false,
            sortOrder: 4,
          },
        ],
      },
    },
  });

  console.log('Created registration form:', form.name);

  // Create checkpoints
  const checkpoints = await Promise.all([
    prisma.checkpoint.create({
      data: {
        eventId: mainEvent.id,
        name: 'Main Entrance',
        type: 'MAIN_ENTRANCE',
        location: 'Lobby',
      },
    }),
    prisma.checkpoint.create({
      data: {
        eventId: mainEvent.id,
        name: 'VIP Lounge',
        type: 'CUSTOM',
        location: 'Floor 2',
        allowedTicketTypes: ['vip-pass'],
      },
    }),
  ]);

  console.log('Created checkpoints:', checkpoints.length);

  // Create coupon
  const coupon = await prisma.coupon.create({
    data: {
      eventId: mainEvent.id,
      code: 'EARLY20',
      description: '20% off for early registrants',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      maxUses: 100,
      validUntil: new Date('2025-03-31'),
    },
  });

  console.log('Created coupon:', coupon.code);

  // Create attendees with orders and tickets for the main event
  console.log('Creating attendees with orders and tickets...');

  for (let i = 0; i < sampleAttendees.length; i++) {
    const attendeeData = sampleAttendees[i];
    const ticketType = i < 5 ? ticketTypes[1] : i < 15 ? ticketTypes[0] : ticketTypes[2]; // VIP, General, Virtual
    const ticketPrice = ticketType.id === 'vip-pass' ? 799 : ticketType.id === 'general-admission' ? 299 : 99;

    // Create attendee
    const attendee = await prisma.attendee.upsert({
      where: {
        eventId_email: {
          eventId: mainEvent.id,
          email: attendeeData.email,
        },
      },
      update: {},
      create: {
        eventId: mainEvent.id,
        email: attendeeData.email,
        firstName: attendeeData.firstName,
        lastName: attendeeData.lastName,
        company: attendeeData.company,
        jobTitle: attendeeData.jobTitle,
        attendeeType: ticketType.id === 'vip-pass' ? AttendeeType.VIP : AttendeeType.GENERAL,
        isApproved: true,
        approvedAt: new Date(),
      },
    });

    // Create order
    const orderNumber = generateOrderNumber();
    const order = await prisma.order.create({
      data: {
        eventId: mainEvent.id,
        organizationId: organization.id,
        orderNumber,
        customerEmail: attendeeData.email,
        customerFirstName: attendeeData.firstName,
        customerLastName: attendeeData.lastName,
        subtotal: ticketPrice,
        total: ticketPrice,
        currency: 'USD',
        status: OrderStatus.COMPLETED,
        completedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
      },
    });

    // Create order item
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: order.id,
        ticketTypeId: ticketType.id,
        attendeeId: attendee.id,
        quantity: 1,
        unitPrice: ticketPrice,
        totalPrice: ticketPrice,
        attendeeEmail: attendeeData.email,
        attendeeFirstName: attendeeData.firstName,
        attendeeLastName: attendeeData.lastName,
      },
    });

    // Create payment
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: ticketPrice,
        currency: 'USD',
        provider: ticketPrice === 0 ? PaymentProvider.FREE : PaymentProvider.STRIPE,
        providerPaymentId: `pi_${Math.random().toString(36).substring(2, 15)}`,
        status: PaymentStatus.SUCCEEDED,
        paidAt: order.completedAt,
      },
    });

    // Create ticket
    await prisma.ticket.create({
      data: {
        ticketTypeId: ticketType.id,
        orderItemId: orderItem.id,
        attendeeId: attendee.id,
        ticketNumber: generateTicketNumber(),
        qrCode: generateQRCode(),
        status: TicketStatus.ACTIVE,
        sentByEmail: true,
        lastSentAt: new Date(),
      },
    });

    // Update ticket type sold count
    await prisma.ticketType.update({
      where: { id: ticketType.id },
      data: { quantitySold: { increment: 1 } },
    });
  }

  console.log('Created attendees:', sampleAttendees.length);

  // Add some attendees to the completed event
  const pastEventAttendees = sampleAttendees.slice(0, 8);
  for (const attendeeData of pastEventAttendees) {
    await prisma.attendee.upsert({
      where: {
        eventId_email: {
          eventId: completedEvent.id,
          email: attendeeData.email,
        },
      },
      update: {},
      create: {
        eventId: completedEvent.id,
        email: attendeeData.email,
        firstName: attendeeData.firstName,
        lastName: attendeeData.lastName,
        company: attendeeData.company,
        jobTitle: attendeeData.jobTitle,
        attendeeType: AttendeeType.GENERAL,
        isApproved: true,
        approvedAt: new Date('2024-10-01'),
      },
    });
  }

  console.log('Added attendees to completed event:', pastEventAttendees.length);

  // Add some attendees to the AI event
  const aiEventAttendees = sampleAttendees.slice(5, 12);
  for (const attendeeData of aiEventAttendees) {
    await prisma.attendee.upsert({
      where: {
        eventId_email: {
          eventId: aiEvent.id,
          email: attendeeData.email,
        },
      },
      update: {},
      create: {
        eventId: aiEvent.id,
        email: attendeeData.email,
        firstName: attendeeData.firstName,
        lastName: attendeeData.lastName,
        company: attendeeData.company,
        jobTitle: attendeeData.jobTitle,
        attendeeType: AttendeeType.GENERAL,
        isApproved: true,
        approvedAt: new Date(),
      },
    });
  }

  console.log('Added attendees to AI event:', aiEventAttendees.length);

  // Create ticket types for other events
  await prisma.ticketType.upsert({
    where: { id: 'ai-general' },
    update: {},
    create: {
      id: 'ai-general',
      eventId: aiEvent.id,
      name: 'Virtual Pass',
      description: 'Full access to all virtual sessions and recordings',
      price: 149,
      quantity: 10000,
      sortOrder: 1,
    },
  });

  await prisma.ticketType.upsert({
    where: { id: 'workshop-ticket' },
    update: {},
    create: {
      id: 'workshop-ticket',
      eventId: events[1].id, // Developer Workshop
      name: 'Workshop Ticket',
      description: 'Hands-on workshop access with lunch included',
      price: 199,
      quantity: 100,
      sortOrder: 1,
    },
  });

  console.log('Created additional ticket types');

  console.log('');
  console.log('========================================');
  console.log('Seeding completed successfully!');
  console.log('========================================');
  console.log('');
  console.log('Demo credentials:');
  console.log('  Email: demo@example.com');
  console.log('  Password: demo123456');
  console.log('');
  console.log('Events created:', events.length);
  console.log('Attendees in main event:', sampleAttendees.length);
  console.log('');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
